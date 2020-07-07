module Mutations
  class SyncCourseToBottlenose < BaseMutation
    argument :course_id, ID, required: true, loads: Types::CourseType

    field :course, Types::CourseType, null: false

    def authorized?(course:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(course:)
      context[:bottlenose_api].sync_course_regs(course)
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
