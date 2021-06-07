# frozen_string_literal: true

module Mutations
  class DestroyQuestion < BaseMutation
    argument :question_id, ID, required: true, loads: Types::QuestionType

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(question:)
      return true if question.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end
  
    def resolve(question:)
      Question.transaction do
        exam_version = question.exam_version
        index = question.index
        destroyed = question.destroy
        raise GraphQL::ExecutionError, question.errors.full_messages.to_sentence unless destroyed

        exam_version.reload
        exam_version.db_questions.where(index: index..).order(:index).each do |q|
          q.update(index: q.index - 1)
        end

        { exam_version: exam_version }
      end
    end
  end
end
