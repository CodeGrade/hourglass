# frozen_string_literal: true

module Subscriptions
  class AnomalyWasDestroyed < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :deleted_id, ID, null: false

    def authorized?(exam:)
      return true if exam.proctors.or(exam.professors).exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(*)
      { deleted_id: object }
    end
  end
end
