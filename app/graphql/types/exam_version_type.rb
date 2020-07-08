module Types
  class ExamVersionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :name, String, null: false
    # field :files, Types::JsonbType, null: false
    # field :info, Types::JsonbType, null: false
    # field :exam_id, Integer, null: false
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :policies, [Types::LockdownPolicyType], null: false
    delegate :policies, to: :object

    field :students, [Types::UserType], null: false
    def students
      object.users
    end

    field :any_started, Boolean, null: false
    def any_started
      object.any_started?
    end

    field :questions, GraphQL::Types::JSON, null: false

    field :reference, GraphQL::Types::JSON, null: false

    field :instructions, GraphQL::Types::JSON, null: false

    field :answers, GraphQL::Types::JSON, null: false

    field :files, GraphQL::Types::JSON, null: false

    field :file_export_url, String, null: false
    def file_export_url
      Rails.application.routes.url_helpers.export_file_api_professor_version_path(object)
    end

    field :archive_export_url, String, null: false
    def archive_export_url
      Rails.application.routes.url_helpers.export_archive_api_professor_version_path(object)
    end
  end
end
