# frozen_string_literal: true

module Types
  # TODO: should only be visible to profs of the course, proctors of the exam, and user
  class RegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :rails_id, Integer, null: false
    delegate :id, to: :object, prefix: :rails

    # field :room_id, Integer, null: true
    field :start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :end_time, GraphQL::Types::ISO8601DateTime, null: true
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :user, Types::UserType, null: false
    field :exam, Types::ExamType, null: false
    field :exam_version, Types::ExamVersionType, null: false

    field :current_answers, GraphQL::Types::JSON, null: false

    field :anomalous, Boolean, null: false
    def anomalous
      object.anomalous?
    end

    field :final, Boolean, null: false
    def final
      object.final?
    end

    field :last_snapshot_time, GraphQL::Types::ISO8601DateTime, null: true
    def last_snapshot_time
      object.snapshots.last&.created_at
    end
  end
end
