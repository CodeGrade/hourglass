# frozen_string_literal: true

module Types
  # TODO: should only be visible to the user, or staff for one of their courses
  class UserType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :username, String, null: false
    field :display_name, String, null: false
    field :nuid, Integer, null: true
    field :email, String, null: false
    field :image_url, String, null: true
    field :admin, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    field :registrations, Types::RegistrationType.connection_type, null: false
    delegate :registrations, to: :object

    field :is_me, Boolean, null: false
    def is_me
      object == context[:current_user]
    end

    # field :staff_registrations, [Types::StaffRegistrationType], null: false
    # delegate :staff_registrations, to: :object

    # field :proctor_registrations, [Types::ProctorRegistrationType], null: false
    # delegate :proctor_registrations, to: :object

    field :professor_course_registrations, Types::ProfessorCourseRegistrationType.connection_type, null: false
    delegate :professor_course_registrations, to: :object
  end
end
