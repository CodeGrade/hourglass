module Types
  class CourseType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :last_sync, GraphQL::Types::ISO8601DateTime, null: true
    field :active, Boolean, null: false
    field :bottlenose_id, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :exams, [Types::ExamType], null: false
    delegate :exams, to: :object
  end
end
