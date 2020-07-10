# frozen_string_literal: true

module Mutations
  class ImpersonateUser < BaseMutation
    argument :user_id, ID, required: true, loads: Types::UserType

    field :success, Boolean, null: false

    def authorized?(*)
      return true if context[:true_user].admin?

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(user:)
      context[:impersonate_user].call(user)
      { success: true }
    end
  end
end
