# frozen_string_literal: true

module Types
  # TODO: should only be visible to proctors of exam, reg.user, course profs
  class MessageType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :sender, Types::UserType, null: false
    field :registration, Types::RegistrationType, null: false

    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
