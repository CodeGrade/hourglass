class Types::SubscriptionType < GraphQL::Schema::Object
  field :anomaly_was_created, subscription: Subscriptions::AnomalyWasCreated
  field :message_was_sent, subscription: Subscriptions::MessageWasSent
end
