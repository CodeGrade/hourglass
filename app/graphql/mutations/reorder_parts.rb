# frozen_string_literal: true

module Mutations
  class ReorderParts < BaseMutation
    argument :question_id, ID, required: true, loads: Types::QuestionType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true

    field :question, Types::QuestionType, null: false

    def authorized?(question:, **_kwargs)
      return true if question.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(question:, from_index:, to_index:)
      question.move_parts(from_index, to_index)

      { question: question }
    end
  end
end
