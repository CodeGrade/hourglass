# frozen_string_literal: true

module Types
  class ExamVersionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :name, String, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :policies, [Types::LockdownPolicyType], null: false

    field :students, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end
    def students
      AssociationLoader.for(ExamVersion, :users, merge: -> { order(display_name: :asc) }).load(object)
    end

    field :any_started, Boolean, null: false do
      guard Guards::PROFESSORS
    end
    def any_started
      object.any_started?
    end
    field :started_count, Integer, null: false do
      guard Guards::PROFESSORS
    end
    def started_count
      object.registrations.started.count
    end

    field :any_finalized, Boolean, null: false do
      guard Guards::PROFESSORS
    end
    def any_finalized
      object.any_finalized?
    end
    field :finalized_count, Integer, null: false do
      guard Guards::PROFESSORS
    end
    def finalized_count
      object.registrations.final.count
    end


    field :questions, GraphQL::Types::JSON, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :reference, GraphQL::Types::JSON, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :instructions, GraphQL::Types::JSON, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :answers, GraphQL::Types::JSON, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :files, GraphQL::Types::JSON, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :rubrics, [Types::RubricType], null: true do
      guard Guards::PROFESSORS
    end
    def rubrics
      AssociationLoader.for(ExamVersion, :rubrics).load(object)
    end

    field :raw_rubrics, GraphQL::Types::JSON, null: true do
      guard Guards::PROFESSORS
    end
    def raw_rubrics
      object.rubric_as_json
    end

    field :file_export_url, String, null: false do
      guard Guards::PROFESSORS
    end
    def file_export_url
      Rails.application.routes.url_helpers.export_file_api_professor_version_path(object)
    end

    field :archive_export_url, String, null: false do
      guard Guards::PROFESSORS
    end
    def archive_export_url
      Rails.application.routes.url_helpers.export_archive_api_professor_version_path(object)
    end

    field :version_announcements, Types::VersionAnnouncementType.connection_type, null: false

    field :grading_locks, Types::GradingLockType.connection_type, null: false do
      guard Guards::PROFESSORS
    end
  end
end
