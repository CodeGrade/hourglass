# frozen_string_literal: true

module Types
  class CourseType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :title, String, null: false

    field :exams, [Types::ExamType], null: false do
      guard ->(obj, _, ctx) {
        (Guards.course_role(ctx[:current_user], ctx) >= Exam.roles[:staff]) ||
        obj.object.all_staff.exists?(ctx[:current_user].id)
      }
    end
    def exams
      AssociationLoader.for(Course, :exams).load(object)
    end

    field :sections, [Types::SectionType], null: false do
      guard Guards::PROFESSORS
    end
    def sections
      AssociationLoader.for(Course, :sections).load(object)
    end

    field :students, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end
    def students
      AssociationLoader.for(Course, :students, merge: -> { order(display_name: :asc) }).load(object)
    end
    field :staff, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end
    def staff
      AssociationLoader.for(Course, :staff, merge: -> { order(display_name: :asc) }).load(object)
    end
    field :professors, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end
    def professors
      AssociationLoader.for(Course, :professors, merge: -> { order(display_name: :asc) }).load(object)
    end
  end
end
