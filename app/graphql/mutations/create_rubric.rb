# frozen_string_literal: true

module Mutations
  # Mutation to create a blank rubric somewhere in an exam version
  class CreateRubric < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :parent_section_id, ID, required: false, loads: Types::RubricType
    argument :type, Types::RubricVariantType, required: true
    argument :description, String, required: false
    argument :points, Float, required: false
    argument :qnum, Integer, required: false
    argument :pnum, Integer, required: false
    argument :bnum, Integer, required: false
    argument :order, Integer, required: false
    
    field :rubric, Types::RubricType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(type:, **args)
      rubric = Rubric.new(type: type.capitalize, **args)
      saved = rubric.save
      raise GraphQL::ExecutionError, rubric.errors.full_messages.to_sentence unless saved

      { rubric: rubric }
    end
  end
end