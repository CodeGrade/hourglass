# frozen_string_literal: true

module Types
  class ExamType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard lambda { |obj, _, ctx|
      (obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx)) ||
       obj.object.all_staff.exists?(ctx[:current_user].id))
    }

    field :name, String, null: false
    field :duration, Integer, null: false
    field :start_time, GraphQL::Types::ISO8601DateTime, null: false
    field :end_time, GraphQL::Types::ISO8601DateTime, null: false

    field :graded, Boolean, null: false do
      guard Guards::PROFESSORS
    end

    field :course, Types::CourseType, null: false do
      guard Guards::PROFESSORS
    end

    field :exam_versions, Types::ExamVersionType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def exam_versions
      AssociationLoader.for(Exam, :exam_versions).load(object)
    end

    field :rooms, [Types::RoomType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def rooms
      AssociationLoader.for(Exam, :rooms).load(object)
    end

    field :checklist, Types::ExamChecklistType, null: false do
      guard Guards::PROFESSORS
    end

    field :anomalies, Types::AnomalyType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def anomalies
      AssociationLoader.for(Exam, :anomalies, merge: -> { unforgiven }).load(object)
    end

    field :messages, Types::MessageType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :version_announcements, Types::VersionAnnouncementType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def version_announcements
      AssociationLoader.for(Exam, :version_announcements, merge: -> { order(created_at: :desc) })
                       .load(object)
    end

    field :room_announcements, Types::RoomAnnouncementType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def room_announcements
      AssociationLoader.for(Exam, :room_announcements, merge: -> { order(created_at: :desc) }).load(object)
    end

    field :exam_announcements, Types::ExamAnnouncementType.connection_type, null: false
    def exam_announcements
      AssociationLoader.for(Exam, :exam_announcements, merge: -> { order(created_at: :desc) }).load(object)
    end

    field :questions, Types::QuestionType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def questions
      AssociationLoader.for(Exam, :questions, merge: -> { order(created_at: :desc) }).load(object)
    end

    field :accommodations, Types::AccommodationType.connection_type, null: false do
      guard Guards::PROFESSORS
    end

    field :registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end

    field :in_progress_registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def in_progress_registrations
      AssociationLoader.for(Exam, :registrations, merge: -> { in_progress }).load(object)
    end

    field :final_registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def final_registrations
      AssociationLoader.for(Exam, :registrations, merge: -> { final }).load(object)
    end

    field :registrations_without_accommodation, Types::RegistrationType.connection_type, null: false do
      guard Guards::PROFESSORS
    end
    def registrations_without_accommodation
      AssociationLoader.for(Exam, :registrations, merge: -> { without_accommodation }).load(object)
    end

    field :registrations_without_rooms, [Types::RegistrationType], null: false do
      guard Guards::PROFESSORS
    end

    field :proctor_registrations_without_rooms, [Types::ProctorRegistrationType], null: false do
      guard Guards::PROFESSORS
    end

    field :unassigned_students, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end

    field :unassigned_staff, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end

    field :my_registration, Types::RegistrationType, null: true
    def my_registration
      current_user = context[:current_user]
      AssociationLoader.for(Exam, :registrations, merge: -> { find_by(user: current_user) }).load(object)
    end

    field :exam_version_upload_url, String, null: false do
      guard Guards::PROFESSORS
    end
    def exam_version_upload_url
      Rails.application.routes.url_helpers.import_api_professor_versions_path(object)
    end

    field :take_url, String, null: false
    def take_url
      Rails.application.routes.url_helpers.take_api_student_exam_path(object)
    end
  end
end
