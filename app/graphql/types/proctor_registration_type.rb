# frozen_string_literal: true

module Types
  class ProctorRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :user, Types::UserType, null: false
    def user
      RecordLoader.for(User).load(object.user_id)
    end

    field :exam, ExamType, null: false
    def exam
      RecordLoader.for(Exam).load(object.exam_id)
    end
  end
end
