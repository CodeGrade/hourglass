module Types
  class ProctorRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :rails_id, Integer, null: false
    delegate :id, to: :object, prefix: :rails

    field :user, Types::UserType, null: false
    # field :user_id, Integer, null: false
    # field :exam_id, Integer, null: false
    # field :room_id, Integer, null: true
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :exam, ExamType, null: false
    delegate :exam, to: :object
  end
end
