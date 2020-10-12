# frozen_string_literal: true

module Mutations
  # Mutation to synchronize course enrollments with Bottlenose course
  class SyncCourseToBottlenose < BaseMutation
    argument :course_id, ID, required: true, loads: Types::CourseType

    field :course, Types::CourseType, null: false

    def authorized?(course:)
      return true if course.user_is_professor?(context[:current_user])
      
      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(course:)
      context[:bottlenose_api].sync_course_regs(course)
      cache_authorization!(nil, course)
      { course: course }
    rescue Bottlenose::UnauthorizedError => e
      raise GraphQL::ExecutionError, e.message
    rescue Bottlenose::ApiError => e
      raise GraphQL::ExecutionError, e.message
    rescue Bottlenose::ConnectionFailed => e
      raise GraphQL::ExecutionError, e.message
    end
  end
end
