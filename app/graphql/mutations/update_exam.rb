# frozen_string_literal: true

module Mutations
  # Mutation to up date an exam's administrative details
  class UpdateExam < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: true

    def authorized?(exam:, **_args)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, **args)
      updated = exam.update(args)
      raise GraphQL::ExecutionError, exam.errors.full_messages.to_sentence unless updated

      cache_authorization!(exam, exam.course)
      { exam: exam }
    end
  end
end
