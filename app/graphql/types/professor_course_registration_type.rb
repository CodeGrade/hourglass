# frozen_string_literal: true

module Types
  class ProfessorCourseRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::PROFESSORS

    field :course, CourseType, null: false
  end
end
