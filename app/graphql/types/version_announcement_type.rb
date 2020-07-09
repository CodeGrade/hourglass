# frozen_string_literal: true

module Types
  class VersionAnnouncementType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :exam_version, Types::ExamVersionType, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
