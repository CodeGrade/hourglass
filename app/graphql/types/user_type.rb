# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :username, String, null: false
    field :display_name, String, null: false
    field :nuid, Integer, null: true
    field :email, String, null: false
    field :image_url, String, null: true
    field :admin, Boolean, null: false

    field :registrations, Types::RegistrationType.connection_type, null: false

    field :is_me, Boolean, null: false
    def is_me
      object == context[:current_user]
    end

    # field :staff_registrations, [Types::StaffRegistrationType], null: false # TODO: for grading
    field :proctor_registrations, Types::ProctorRegistrationType.connection_type, null: false do
      guard ->(obj, _, ctx) { obj.object == ctx[:current_user] }
    end

    field :professor_course_registrations, Types::ProfessorCourseRegistrationType.connection_type, null: false do
      guard ->(obj, _, ctx) { obj.object == ctx[:current_user] }
    end
  end
end
