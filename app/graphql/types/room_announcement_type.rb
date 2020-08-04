# frozen_string_literal: true

module Types
  class RoomAnnouncementType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :room, Types::RoomType, null: false
    def room
      RecordLoader.for(Room).load(object.room_id)
    end
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
