# frozen_string_literal: true

module Types
  class ExamType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard lambda { |obj, _, ctx|
      (obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx)))
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
      guard Guards::ALL_STAFF
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
      AssociationLoader.for(Exam, :anomalies, merge: -> { unforgiven }, includes: [registration: [ :accommodation, { exam_version: :exam } ]]).load(object)
    end

    field :messages, Types::MessageType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def messages
      AssociationLoader.for(Exam, :messages, includes: [:registration]).load(object)
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

    field :student_questions, Types::StudentQuestionType.connection_type, null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def student_questions
      AssociationLoader.for(Exam, :student_questions, merge: -> { order(created_at: :desc) }).load(object)
    end

    field :accommodations, Types::AccommodationType.connection_type, null: false do
      guard Guards::PROFESSORS
    end

    field :registrations, [Types::RegistrationType], null: false, extras: [:lookahead] do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def registrations(lookahead:)
      includes = [:exam_version, accommodation: { registration: { exam_version: :exam }}]
      if [:current_grading, :current_part_scores].any? { |f| lookahead.selects?(f) }
        includes[1].merge!({
          grading_comments: [
            :creator, :body_item,
            question: { parts: :body_items },
            part: :body_items,
            preset_comment: [{ rubric_preset: [{ rubric: :parent_section }] }]
          ],
          grading_locks: [:question, :part],
          grading_checks: [:creator, :question, :part, :body_item],
          exam_version: {
            rubrics: ExamVersion.rubric_includes
          }
        })
      end
      AssociationLoader.for(Exam, :registrations, includes: includes).load(object)
    end

    field :in_progress_registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def in_progress_registrations
      AssociationLoader.for(Exam, :registrations, merge: -> { in_progress }, includes: [:exam_version, accommodation: { registration: { exam_version: :exam }}]).load(object)
    end

    field :final_registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def final_registrations
      AssociationLoader.for(Exam, :registrations, merge: -> { final }, includes: [:exam_version, accommodation: { registration: { exam_version: :exam }}]).load(object)
    end

    field :registrations_without_accommodation, Types::RegistrationType.connection_type, null: false do
      guard Guards::PROFESSORS
    end
    def registrations_without_accommodation
      AssociationLoader.for(Exam, :registrations, merge: -> { without_accommodation }, includes: [:exam_version, accommodation: { registration: { exam_version: :exam }}]).load(object)
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

    field :bottlenose_export, GraphQL::Types::JSON, null: false do
      guard Guards::PROFESSORS
    end

    field :bottlenose_exam_grades, GraphQL::Types::JSON, null: false do
      guard Guards::PROFESSORS
    end
    
    field :bottlenose_exam_summary, GraphQL::Types::JSON, null: false do
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
