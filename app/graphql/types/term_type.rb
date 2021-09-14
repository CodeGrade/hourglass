# frozen_string_literal: true

module Types
  class TermType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :name, String, null: false

    field :my_registrations, [Types::RegistrationType], null: false
    def my_registrations
      object.registrations.where(user: context[:current_user]).current_exams
    end

    field :my_future_registrations, [Types::FutureRegistrationType], null: false
    def my_future_registrations
      object.registrations.where(user: context[:current_user]).future_exams
    end

    field :my_prior_registrations, [Types::RegistrationType], null: false
    def my_prior_registrations
      object.registrations.where(user: context[:current_user]).past_exams
    end

    field :my_staff_registrations, Types::StaffRegistrationType.connection_type, null: false
    def my_staff_registrations
      object.staff_registrations.where(user: context[:current_user])
    end

    field :my_proctor_registrations, Types::ProctorRegistrationType.connection_type, null: false
    def my_proctor_registrations
      object.proctor_registrations.where(user: context[:current_user])
    end

    field :my_professor_course_registrations, Types::ProfessorCourseRegistrationType.connection_type, null: false
    def my_professor_course_registrations
      object.professor_course_registrations.where(user: context[:current_user])
    end
  end
end
