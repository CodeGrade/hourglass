# frozen_string_literal: true

module Mutations
  # Mutation to start impersonating another user
  class ImpersonateUser < BaseMutation
    argument :user_id, ID, required: true, loads: Types::UserType
    argument :course_id, ID, required: false, loads: Types::CourseType

    field :success, Boolean, null: false

    def authorized?(user:, course: nil)
      return true if context[:true_user].admin?
      return true if course&.user_is_professor?(context[:true_user]) && course&.user_member?(user)

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(user:, **_args)
      context[:impersonate_user].call(user)
      { success: true }
    end
  end
end
