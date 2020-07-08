module Types
  class ExamAnnouncementType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :exam_id, Integer, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
