module Types
  class StaffRegistrationType < Types::BaseObject
    field :id, ID, null: false
    field :section_id, Integer, null: false
    field :user_id, Integer, null: false
    field :ta, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, CourseType, null: false
    delegate :course, to: :object
  end
end
