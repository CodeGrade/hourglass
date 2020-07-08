# frozen_string_literal: true

module Types
  class ProctorRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :user, Types::UserType, null: false

    field :exam, ExamType, null: false
    delegate :exam, to: :object
  end
end
