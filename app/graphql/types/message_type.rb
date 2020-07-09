# frozen_string_literal: true

module Types
  class MessageType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :sender, Types::UserType, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :registration, Types::RegistrationType, null: false

    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
