# frozen_string_literal: true

module Types
  class TermType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :name, String, null: false

    field :my_registrations, [Types::RegistrationType], null: false
    def my_registrations
      object.registrations.where(user: context[:current_user]).current_exams
    end

    field :future_registrations, [Types::FutureRegistrationType], null: false
    def future_registrations
      object.registrations.where(user: context[:current_user]).future_exams
    end

    field :prior_registrations, [Types::RegistrationType], null: false
    def prior_registrations
      object.registrations.where(user: context[:current_user]).past_exams
    end
  end
end
