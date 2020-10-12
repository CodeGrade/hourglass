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

    def cache_authorization!(exam, course)
      exam_role = Exam.roles[:no_reg]
      course_role = Exam.roles[:no_reg]
      if course.user_is_professor?(context[:current_user])
        course_role = exam_role = Exam.roles[:professor]
      elsif exam&.user_is_proctor?(context[:current_user].id)
        exam_role = Exam.roles[:proctor]
        course_role = Exam.roles[:staff]
      elsif course.user_is_staff?(context[:current_user])
        course_role = Exam.roles[:staff]
      elsif course.user_is_student?(context[:current_user])
        course_role = Exam.roles[:student]
      end
      ac = context[:access_cache]
      ac[:role_for_exam] = {} unless ac.key? :role_for_exam
      ac[:role_for_exam][context[:current_user].id] = exam_role
      ac[:role_for_course] = {} unless ac.key? :role_for_course
      ac[:role_for_course][context[:current_user].id] = course_role
    end

    field :exam, ExamType, null: false do
      argument :id, ID, required: true
    end

    def exam(id:)
      exam = HourglassSchema.object_from_id(id, context)
      cache_authorization!(exam, exam.course)
      exam
    end

    field :exam_version, ExamVersionType, null: false do
      argument :id, ID, required: true
    end

    def exam_version(id:)
      exam_version = HourglassSchema.object_from_id(id, context)
      cache_authorization!(exam_version.exam, exam_version.exam.course)
      exam_version
    end

    field :registration, Types::RegistrationType, null: true do
      argument :id, ID, required: true
      guard lambda { |obj, args, ctx |
        begin
          reg = HourglassSchema.object_from_id(args[:id], ctx)
          reg.visible_to?(ctx[:current_user], Guards.exam_role(ctx[:current_user], ctx), Guards.course_role(ctx[:current_user], ctx))
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
      course = HourglassSchema.object_from_id(id, context)
      cache_authorization!(nil, course)
      course
    end

    field :users, [UserType], null: false do
      guard Guards::CURRENT_USER_ADMIN
    end
    def users
      User.all
    end
  end
end
