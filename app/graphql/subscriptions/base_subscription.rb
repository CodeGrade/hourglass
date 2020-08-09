# frozen_string_literal: true

module Subscriptions
  # Base class for app-specific GraphQL subscriptions
  class BaseSubscription < GraphQL::Schema::Subscription
    object_class Types::BaseObject
    field_class Types::BaseField
    argument_class Types::BaseArgument
  end
end
