# frozen_string_literal: true

module Mutations
  # Mutation to up date an exam's administrative details
  class UpdateVersionTiming < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :duration, Integer, required: false
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: false
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: false

    field :exam_version, Types::ExamVersionType, null: false
    field :exam, Types::ExamType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:, **args)
      updated = exam_version.update(args)
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless updated

      cache_authorization!(exam_version.exam, exam_version.course)
      { exam_version: exam_version, exam: exam_version.exam }
    end
  end
end
