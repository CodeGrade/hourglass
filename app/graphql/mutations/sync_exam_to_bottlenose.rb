# frozen_string_literal: true

module Mutations
  # Mutation to synchronize exam grades with Bottlenose course
  class SyncExamToBottlenose < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :exam, Types::ExamType, null: false

    def authorized?(exam:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      context[:bottlenose_api].create_exam(exam)
      { exam: exam }
    rescue Bottlenose::UnauthorizedError => e
      raise GraphQL::ExecutionError, e.message
    rescue Bottlenose::ApiError => e
      raise GraphQL::ExecutionError, e.message
    rescue Bottlenose::ConnectionFailed => e
      raise GraphQL::ExecutionError, e.message
    end
  end
end
