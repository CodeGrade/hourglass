# frozen_string_literal: true

module Types
  class CourseType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :title, String, null: false

    field :exams, [Types::ExamType], null: false do
      guard ->(obj, _, ctx) { obj.object.all_staff.exists? ctx[:current_user].id }
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
  end
end
