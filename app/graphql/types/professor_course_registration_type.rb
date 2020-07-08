# frozen_string_literal: true

module Types
  # TODO: should only be visible to user
  class ProfessorCourseRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :course_id, Integer, null: false
    field :user_id, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, CourseType, null: false
    delegate :course, to: :object
  end
end
