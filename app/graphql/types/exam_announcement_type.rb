module Types
  class ExamAnnouncementType < Types::BaseObject
    # TODO: should only be visible to users of the course

    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :exam_id, Integer, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
