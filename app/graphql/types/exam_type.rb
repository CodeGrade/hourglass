module Types
  class ExamType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :rails_id, Integer, null: false
    delegate :id, to: :object, prefix: :rails

    field :name, String, null: false
    field :bottlenose_assignment_id, Integer, null: true
    field :duration, Integer, null: false
    field :start_time, GraphQL::Types::ISO8601DateTime, null: false
    field :end_time, GraphQL::Types::ISO8601DateTime, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, Types::CourseType, null: false
    field :exam_versions, [Types::ExamVersionType], null: false

    field :students, [Types::UserType], null: false
    field :rooms, [Types::RoomType], null: false

    field :checklist, Types::ExamChecklistType, null: false

    field :anomalies, Types::AnomalyType.connection_type, null: false

    field :messages, [Types::MessageType], null: false

    field :version_announcements, [Types::VersionAnnouncementType], null: false

    field :room_announcements, [Types::RoomAnnouncementType], null: false

    field :exam_announcements, [Types::ExamAnnouncementType], null: false

    field :questions, [Types::QuestionType], null: false

    field :accommodations, Types::AccommodationType.connection_type, null: false

    field :registration, Types::RegistrationType, null: true do
      argument :id, ID, required: true
    end

    def registration(id:)
      HourglassSchema.object_from_id(id, context)
    end

    field :rails_registration, Types::RegistrationType, null: true do
      argument :rails_id, Integer, required: true
    end

    def rails_registration(rails_id:)
      object.registrations.find_by(id: rails_id)
    end

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
  end
end