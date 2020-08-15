# frozen_string_literal: true

module Types
  class RegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :room, Types::RoomType, null: true
    field :start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :end_time, GraphQL::Types::ISO8601DateTime, null: true

    field :user, Types::UserType, null: false
    field :exam, Types::ExamType, null: false
    field :exam_version, Types::ExamVersionType, null: false

    field :current_answers, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end

    field :grading_checks, [Types::GradingCheckType], null: false do
      guard Guards::ALL_STAFF
    end

    field :grading_comments, Types::GradingCommentType.connection_type, null: false do
      guard Guards::ALL_STAFF
    end

    field :anomalous, Boolean, null: false
    def anomalous
      object.anomalous?
    end

    field :started, Boolean, null: false
    def started
      object.started?
    end

    field :over, Boolean, null: false
    def over
      object.over?
    end

    field :final, Boolean, null: false
    def final
      object.final?
    end

    field :last_snapshot, GraphQL::Types::ISO8601DateTime, null: true
    def last_snapshot
      object.snapshots.last&.created_at
    end

    field :questions, Types::QuestionType.connection_type, null: false
    def questions
      object.questions.order(created_at: :desc)
    end

    field :messages, Types::MessageType.connection_type, null: false
    def messages
      object.messages.order(created_at: :desc)
    end
  end
end
