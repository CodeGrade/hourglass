# frozen_string_literal: true

module Types
  class SubscriptionType < GraphQL::Schema::Object
    field :anomaly_was_created, subscription: Subscriptions::AnomalyWasCreated
    field :anomaly_was_destroyed, subscription: Subscriptions::AnomalyWasDestroyed

    field :message_received, subscription: Subscriptions::MessageReceived
    field :message_was_sent, subscription: Subscriptions::MessageWasSent

    field :question_was_asked, subscription: Subscriptions::QuestionWasAsked

    field :exam_announcement_was_sent, subscription: Subscriptions::ExamAnnouncementWasSent

    field :version_announcement_received, subscription: Subscriptions::VersionAnnouncementReceived
    field :version_announcement_was_sent, subscription: Subscriptions::VersionAnnouncementWasSent

    field :room_announcement_received, subscription: Subscriptions::RoomAnnouncementReceived
    field :room_announcement_was_sent, subscription: Subscriptions::RoomAnnouncementWasSent
  end
end
