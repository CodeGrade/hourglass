# frozen_string_literal: true

module Types
  class SubscriptionType < GraphQL::Schema::Object
    field :anomaly_was_created, subscription: Subscriptions::AnomalyWasCreated
    field :message_was_sent, subscription: Subscriptions::MessageWasSent
    field :message_received, subscription: Subscriptions::MessageReceived
    field :question_was_asked, subscription: Subscriptions::QuestionWasAsked
  end
end
