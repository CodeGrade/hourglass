# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.
    add_field(GraphQL::Types::Relay::NodeField)
    add_field(GraphQL::Types::Relay::NodesField)

    field :impersonating, Boolean, null: false
    def impersonating
      context[:current_user] != context[:true_user]
    end

    field :me, UserType, null: false
    def me
      context[:current_user]
    end

    field :exam, ExamType, null: false do
      argument :id, ID, required: true
    end

    def exam(id:)
      HourglassSchema.object_from_id(id, context)
    end

    field :exam_version, ExamVersionType, null: false do
      argument :id, ID, required: true
    end

    def exam_version(id:)
      HourglassSchema.object_from_id(id, context)
    end

    field :registration, Types::RegistrationType, null: true do
      argument :id, ID, required: true
      guard lambda { |obj, args, ctx |
        begin
          reg = HourglassSchema.object_from_id(args[:id], ctx)
          reg.visible_to?(ctx[:current_user])
        rescue ActiveRecord::RecordNotFound, RuntimeError => e
          false
        end
      }
    end

    def registration(id:)
      HourglassSchema.object_from_id(id, context)
    end

    field :course, CourseType, null: false do
      argument :id, ID, required: true
    end

    def course(id:)
      HourglassSchema.object_from_id(id, context)
    end

    field :users, [UserType], null: false do
      guard Guards::CURRENT_USER_ADMIN
    end
    def users
      User.all
    end
  end
end
