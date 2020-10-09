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
      guard Guards::ALL_STAFF
    end

    field :reference, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end

    field :instructions, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end

    field :answers, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end

    field :files, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end

    field :rubrics, [Types::RubricType], null: true do
      guard Guards::ALL_STAFF
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

    field :completion_summary, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end
    def completion_summary
      gls_by_qnum = object.grading_locks.group_by(&:qnum)
      object.questions.each_with_index.map do |q, qnum|
        gls_by_pnum = (gls_by_qnum[qnum] || []).group_by(&:pnum)
        q['parts'].each_with_index.map do |_, pnum|
          { 
            notStarted: gls_by_pnum[pnum].count { |gl| gl.grader_id.nil? && gl.completed_by_id.nil? },
            inProgress: gls_by_pnum[pnum].count { |gl| gl.completed_by_id.nil? && !gl.grader_id.nil? },
            finished: gls_by_pnum[pnum].count { |gl| !gl.completed_by_id.nil? },
          } 
        end
      end
    end
  end
end
