# frozen_string_literal: true

module Types
  class TermType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :name, String, null: false
  end
end
