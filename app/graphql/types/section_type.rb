# frozen_string_literal: true

module Types
  # TODO: should only be visible to profs of the course and staff of the sec
  class SectionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    # field :course_id, Integer, null: false
    field :title, String, null: false
    # field :bottlenose_id, Integer, null: false
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :students, [Types::UserType], null: false
    field :staff, [Types::UserType], null: false
  end
end
