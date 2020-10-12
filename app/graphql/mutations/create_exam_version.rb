# frozen_string_literal: true

module Mutations
  # Mutation to create a new version for an exam
  class CreateExamVersion < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam:)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      version = ExamVersion.new_empty(exam)
      saved = version.save
      raise GraphQL::ExecutionError, version.errors.full_messages.to_sentence unless saved

      { exam_version: version }
    end
  end
end
