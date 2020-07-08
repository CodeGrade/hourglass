module Types
  class VersionAnnouncementType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :exam_version, Types::ExamVersionType, null: false
    # field :exam_version_id, Integer, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
