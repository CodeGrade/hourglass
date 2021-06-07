# frozen_string_literal: true

module Mutations
  class CreatePart < BaseMutation
    argument :question_id, ID, required: true, loads: Types::QuestionType
    argument :name, String, required: false
    argument :description, String, required: false
    argument :extra_credit, Boolean, required: false
    argument :points, Float, required: true

    field :question, Types::QuestionType, null: false

    def authorized?(question:, **_args)
      return true if question.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      index = args[:question].parts.count
      part = Part.new(index: index, **args)
      saved = part.save
      raise GraphQL::ExecutionError, part.errors.full_messages.to_sentence unless saved

      { question: part.question }
    end
  end
end
