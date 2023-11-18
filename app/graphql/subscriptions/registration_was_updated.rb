# frozen_string_literal: true

module Subscriptions
  class RegistrationWasUpdated < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :registration, Types::RegistrationType, null: false

    def authorized?(exam:)
      return true if exam.proctors.exists? context[:current_user].id
      return true if exam.professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      {
        registration: object,
      }
    end
  end
end
