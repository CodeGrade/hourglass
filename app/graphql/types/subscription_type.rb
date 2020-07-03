class Types::SubscriptionType < GraphQL::Schema::Object
  field :anomaly_was_created, subscription: Subscriptions::AnomalyWasCreated
end
