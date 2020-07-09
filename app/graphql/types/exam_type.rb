# frozen_string_literal: true

module Types
  class ExamType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :name, String, null: false
    field :duration, Integer, null: false
    field :start_time, GraphQL::Types::ISO8601DateTime, null: false
    field :end_time, GraphQL::Types::ISO8601DateTime, null: false
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, Types::CourseType, null: false
    field :exam_versions, Types::ExamVersionType.connection_type, null: false

    field :students, [Types::UserType], null: false
    field :rooms, [Types::RoomType], null: false

    field :checklist, Types::ExamChecklistType, null: false

    field :anomalies, Types::AnomalyType.connection_type, null: false

    field :messages, Types::MessageType.connection_type, null: false

    field :version_announcements, Types::VersionAnnouncementType.connection_type, null: false
    def version_announcements
      object.version_announcements.order(created_at: :desc)
    end

    field :room_announcements, Types::RoomAnnouncementType.connection_type, null: false
    def room_announcements
      object.room_announcements.order(created_at: :desc)
    end

    field :exam_announcements, Types::ExamAnnouncementType.connection_type, null: false
    def exam_announcements
      object.exam_announcements.order(created_at: :desc)
    end

    field :questions, Types::QuestionType.connection_type, null: false
    def questions
      object.questions.order(created_at: :desc)
    end

    field :accommodations, Types::AccommodationType.connection_type, null: false

    field :registrations, [Types::RegistrationType], null: false

    field :final_registrations, [Types::RegistrationType], null: false
    def final_registrations
      object.registrations.final
    end

    field :registrations_without_accommodation, Types::RegistrationType.connection_type, null: false
    def registrations_without_accommodation
      object.registrations.without_accommodation
    end

    field :registrations_without_rooms, [Types::RegistrationType], null: false
    field :proctor_registrations_without_rooms, [Types::ProctorRegistrationType], null: false

    field :unassigned_students, [Types::UserType], null: false
    field :unassigned_staff, [Types::UserType], null: false

    field :my_registration, Types::RegistrationType, null: true
    def my_registration
      object.registrations.find_by(user: context[:current_user])
    end

    field :exam_version_upload_url, String, null: false
    def exam_version_upload_url
      Rails.application.routes.url_helpers.import_api_professor_versions_path(object)
    end

    field :take_url, String, null: false
    def take_url
      Rails.application.routes.url_helpers.take_api_student_exam_path(object)
    end
  end
end
