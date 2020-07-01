module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :username, String, null: false
    field :display_name, String, null: false
    field :nuid, Integer, null: true
    field :email, String, null: false
    field :image_url, String, null: true
    field :admin, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    # field :registrations, [Types::RegistrationType], null: false
    # delegate :registrations, to: :object

    # field :staff_registrations, [Types::StaffRegistrationType], null: false
    # delegate :staff_registrations, to: :object

    # field :proctor_registrations, [Types::ProctorRegistrationType], null: false
    # delegate :proctor_registrations, to: :object

    # field :professor_course_registrations, [Types::ProfessorCourseRegistrationType], null: false
    # delegate :professor_course_registrations, to: :object
  end
end
