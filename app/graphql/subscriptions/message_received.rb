# frozen_string_literal: true

module Subscriptions
  class MessageReceived < Subscriptions::BaseSubscription
    argument :registration_id, ID, required: true, loads: Types::RegistrationType

    field :message, Types::MessageType, null: false
    field :messages_edge, Types::MessageType.edge_type, null: false

    def authorized?(registration:)
      return true if registration.user == context[:current_user]

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(registration:)
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: registration,
        collection: registration.messages,
        item: object,
        context: context
      )

      {
        message: object,
        messages_edge: range_add.edge,
      }
    end
  end
end
