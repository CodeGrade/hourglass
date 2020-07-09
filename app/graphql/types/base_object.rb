# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField

    module Guards
      VISIBILITY = ->(obj, _args, ctx) { obj.object.visible_to?(ctx[:current_user]) }
      PROFESSORS = ->(obj, _args, ctx) { obj.object.professors.exists? ctx[:current_user].id }
      PROCTORS_AND_PROFESSORS = ->(obj, _args, ctx) { obj.object.proctors_and_professors.exists? ctx[:current_user].id }
    end
  end
end
