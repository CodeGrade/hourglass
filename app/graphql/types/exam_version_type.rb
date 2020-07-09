# frozen_string_literal: true

module Types
  class ExamVersionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :name, String, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    # TODO: move this to /take and lock this field down to proctors_and_profs
    field :policies, [Types::LockdownPolicyType], null: false

    field :students, [Types::UserType], null: false, method: :users do
      guard Guards::PROFESSORS
    end

    field :any_started, Boolean, null: false do
      guard Guards::PROFESSORS
    end
    def any_started
      object.any_started?
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
  end
end
