# frozen_string_literal: true

module Types
  class AccommodationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    description 'Accommodates a student with additional time.'

    field :registration, Types::RegistrationType, null: false
    field :new_start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :percent_time_expansion, Integer, null: false
  end
end
