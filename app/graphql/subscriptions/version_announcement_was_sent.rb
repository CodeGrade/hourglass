# frozen_string_literal: true

module Subscriptions
  class VersionAnnouncementWasSent < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :version_announcement, Types::VersionAnnouncementType, null: false
    field :version_announcements_edge, Types::VersionAnnouncementType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.proctors.or(exam.professors).exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: exam,
        collection: exam.version_announcements,
        item: object,
        context: context
      )
      {
        version_announcement: object,
        version_announcements_edge: range_add.edge,
      }
    end
  end
end
