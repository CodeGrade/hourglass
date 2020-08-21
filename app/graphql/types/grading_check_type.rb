# frozen_string_literal: true

module Types
  class GradingCheckType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :qnum, Integer, null: false
    field :pnum, Integer, null: false
    field :bnum, Integer, null: false
    field :points, Float, null: true
    field :creator, Types::UserType, null: false
  end
end
