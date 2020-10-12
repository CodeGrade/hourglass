# frozen_string_literal: true

module Mutations
  # Mutation to update the contents of an exam version
  class UpdateExamVersion < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :name, String, required: true
    argument :info, String, required: true
    argument :files, String, required: true

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:, **update)
      updated = exam_version.update(update)
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless updated

      cache_authorization!(exam_version.exam, exam_version.exam.course)
      { exam_version: exam_version }
    end
  end
end
