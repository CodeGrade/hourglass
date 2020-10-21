# frozen_string_literal: true

module Types
  class FutureRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :room, Types::RoomType, null: true
    def room
      RecordLoader.for(Room).load(object.room_id)
    end
    field :start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :end_time, GraphQL::Types::ISO8601DateTime, null: true

    field :user, Types::UserType, null: false

    field :course_title, String, null: false
    def course_title
      object.exam.course.title
    end
    field :exam_name, String, null: false
    def exam_name
      object.exam.name
    end
    field :accommodated_start_time, GraphQL::Types::ISO8601DateTime, null: false
    def accommodated_start_time
      object.accommodated_start_time
    end
  end
end
