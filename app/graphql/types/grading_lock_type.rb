# frozen_string_literal: true

module Types
  class GradingLockType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :registration, Types::RegistrationType, null: false
    field :grader, Types::UserType, null: true
    field :completed_by, Types::UserType, null: true

    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
