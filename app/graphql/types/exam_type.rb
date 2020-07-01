module Types
  class ExamType < Types::BaseObject
    field :id, ID, null: false
    field :course_id, Integer, null: false
    field :name, String, null: false
    field :bottlenose_assignment_id, Integer, null: true
    field :duration, Integer, null: false
    field :start_time, GraphQL::Types::ISO8601DateTime, null: false
    field :end_time, GraphQL::Types::ISO8601DateTime, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, Types::CourseType, null: false
    delegate :course, to: :object
  end
end
