# frozen_string_literal: true

module Types
  class StaffRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :course, CourseType, null: false
  end
end
