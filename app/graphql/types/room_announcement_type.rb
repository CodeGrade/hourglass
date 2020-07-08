# frozen_string_literal: true

module Types
  # TODO: should only be visible to profs of the course, proctors of the exam, and students in room
  class RoomAnnouncementType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :room, Types::RoomType, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
