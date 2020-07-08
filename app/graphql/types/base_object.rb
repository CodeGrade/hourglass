# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField

    module Guards
      VISIBILITY = ->(obj, _args, ctx) { obj.object.visible_to?(ctx[:current_user]) }
    end
  end
end
