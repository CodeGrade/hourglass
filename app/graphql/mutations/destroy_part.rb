# frozen_string_literal: true

module Mutations
  class DestroyPart < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType

    field :question, Types::QuestionType, null: false

    def authorized?(part:)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end
  
    def resolve(part:)
      Part.transaction do
        question = part.question
        index = part.index
        destroyed = part.destroy
        raise GraphQL::ExecutionError, part.errors.full_messages.to_sentence unless destroyed

        question.reload
        question.parts.where(index: index..).order(:index).each do |q|
          q.update(index: q.index - 1)
        end

        { question: question }
      end
    end

  end
end
