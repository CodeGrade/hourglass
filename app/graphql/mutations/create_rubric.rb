# frozen_string_literal: true

module Mutations
  # Mutation to create a blank rubric somewhere in an exam version
  class CreateRubric < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :parent_section_id, ID, required: false, loads: Types::RubricType
    argument :type, Types::RubricVariantType, required: true
    argument :description, String, required: false
    argument :points, Float, required: false
    argument :question_id, ID, required: false, loads: Types::QuestionType
    argument :part_id, ID, required: false, loads: Types::PartType
    argument :body_item_id, ID, required: false, loads: Types::BodyItemType

    field :parent_section, Types::RubricType, null: false
    field :rubric, Types::RubricType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(type:, **args)
      parent_section = args[:parent_section]
      raise GraphQL::ExecutionError, 'Cannot create root rubrics' if parent_section.nil?

      order = parent_section.subsections&.count || 0
      rubric = Rubric.new(type: type.capitalize, order: order, **args)
      saved = rubric.save
      raise GraphQL::ExecutionError, rubric.errors.full_messages.to_sentence unless saved

      exam_version = rubric.exam_version
      cache_authorization!(exam_version.exam, exam_version.exam.course)
      { parent_section: parent_section, rubric: rubric }
    end
  end
end
