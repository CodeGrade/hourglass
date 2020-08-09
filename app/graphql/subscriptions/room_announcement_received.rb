# frozen_string_literal: true

module Subscriptions
  class RoomAnnouncementReceived < Subscriptions::BaseSubscription
    argument :room_id, ID, required: true, loads: Types::RoomType

    field :room_announcement, Types::RoomAnnouncementType, null: false
    field :room_announcements_edge, Types::RoomAnnouncementType.edge_type, null: false

    def authorized?(room:)
      return true if room.students.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(room:)
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: room,
        collection: room.room_announcements,
        item: object,
        context: context,
      )
      {
        room_announcement: object,
        room_announcements_edge: range_add.edge,
      }
    end
  end
end
