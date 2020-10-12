# frozen_string_literal: true

module Types
  class AnomalyType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :reason, String, null: false

    field :registration, Types::RegistrationType, null: false
    def registration
      RecordLoader.for(Registration).load(object.registration_id)
    end

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    field :prior_anomaly_count, Integer, null: false
  end
end
