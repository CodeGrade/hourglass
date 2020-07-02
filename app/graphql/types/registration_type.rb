module Types
  class RegistrationType < Types::BaseObject
    global_id_field :id

    field :user_id, Integer, null: false
    field :room_id, Integer, null: true
    field :exam_version_id, Integer, null: false
    field :start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :end_time, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :exam, Types::ExamType, null: false
    delegate :exam, to: :object
  end
end
