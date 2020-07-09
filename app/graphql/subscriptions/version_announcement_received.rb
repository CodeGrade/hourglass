# frozen_string_literal: true

module Subscriptions
  class VersionAnnouncementReceived < Subscriptions::BaseSubscription
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType

    field :version_announcement, Types::VersionAnnouncementType, null: false
    field :version_announcements_edge, Types::VersionAnnouncementType.edge_type, null: false

    def authorized?(exam_version:)
      return true if exam_version.students.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam_version:)
      range_add = GraphQL::Relay::RangeAdd.new({
        parent: exam_version, collection: exam_version.version_announcements, item: object, context: context
      })
      {
        version_announcement: object,
        version_announcements_edge: range_add.edge,
      }
    end
  end
end
