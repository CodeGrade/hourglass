# frozen_string_literal: true

module Subscriptions
  class ExamAnnouncementWasSent < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :exam_announcement, Types::ExamAnnouncementType, null: false
    field :exam_announcements_edge, Types::ExamAnnouncementType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.students.exists? context[:current_user].id
      return true if exam.proctors.exists? context[:current_user].id
      return true if exam.professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: exam,
        collection: exam.exam_announcements,
        item: object,
        context: context
      )
      {
        exam_announcement: object,
        exam_announcements_edge: range_add.edge,
      }
    end
  end
end
