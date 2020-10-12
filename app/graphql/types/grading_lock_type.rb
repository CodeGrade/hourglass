# frozen_string_literal: true

module Types
  class GradingLockType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id 
    field :id, ID, null: false, guard: ->(_obj, _args, _ctx) { true }

    guard Guards::VISIBILITY

    field :registration, Types::RegistrationType, null: false
    def registration
      RecordLoader.for(Registration).load(object.registration_id)
    end
    field :grader, Types::UserType, null: true, guard: ->(obj, _args, ctx) {
      obj.object.grader_id.nil? || obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx))
    }
    def grader
      RecordLoader.for(User).load(object.grader_id)
    end
    field :completed_by, Types::UserType, null: true, guard: ->(obj, _args, ctx) {
      obj.object.completed_by_id.nil? || obj.object.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx))
    }
    def completed_by
      RecordLoader.for(User).load(object.completed_by_id)
    end

    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
