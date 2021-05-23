# frozen_string_literal: true

module Mutations
  # Mutation to create a single question
  class CreateQuestion < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :name, String, required: false
    argument :description, String, required: false
    argument :extra_credit, Boolean, required: false
    argument :separate_subparts, Boolean, required: false

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      index = args[:exam_version].db_questions.count
      question = Question.new(index: index, **args)
      saved = question.save
      raise GraphQL::ExecutionError, question.errors.full_messages.to_sentence unless saved

      { exam_version: question.exam_version }
    end
  end
end
