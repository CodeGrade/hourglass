# frozen_string_literal: true

module Types
  # TODO: should only be visible to profs of the course and proctors of the exam
  class AnomalyType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :reason, String, null: false

    field :registration, Types::RegistrationType, null: false

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
