# frozen_string_literal: true

module Subscriptions
  class RoomAnnouncementWasSent < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :room_announcement, Types::RoomAnnouncementType, null: false
    field :room_announcements_edge, Types::RoomAnnouncementType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.proctors.or(exam.professors).exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new({
        parent: exam, collection: exam.room_announcements, item: object, context: context
      })
      {
        room_announcement: object,
        room_announcements_edge: range_add.edge,
      }
    end
  end
end
