# frozen_string_literal: true

module Types
  class GradingLockType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::ALL_STAFF

    field :registration, Types::RegistrationType, null: false do
      guard Guards::VISIBILITY
    end
    def registration
      RecordLoader.for(Registration).load(object.registration_id)
    end

    field :grader, Types::UserType, null: true do
      guard ->(obj, _args, ctx) {
        obj.object.grader_id.nil? || obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx))
      }
    end
    def grader
      RecordLoader.for(User).load(object.grader_id)
    end

    field :completed_by, Types::UserType, null: true do
      guard ->(obj, _args, ctx) {
        obj.object.completed_by_id.nil? || obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx))
      }
    end
    def completed_by
      RecordLoader.for(User).load(object.completed_by_id)
    end

    field :qnum, Integer, null: false
    def qnum
      RecordLoader.for(Question).load(object.question_id).then{|q| q.index}
    end

    field :pnum, Integer, null: false
    def pnum
      RecordLoader.for(Part).load(object.part_id).then{|q| q.index}
    end

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
