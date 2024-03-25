# frozen_string_literal: true

module Subscriptions
  class GradingLockUpdated < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :grading_lock, Types::GradingLockType, null: false
    field :exam, Types::ExamType, null: false

    def authorized?(exam:)
      return true if exam.proctors.exists? context[:current_user].id
      return true if exam.professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      {
        grading_lock: object,
        exam: exam
      }
    end
  end
end
