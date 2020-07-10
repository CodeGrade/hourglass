# frozen_string_literal: true

module Mutations
  class StopImpersonating < BaseMutation
    field :success, Boolean, null: false

    def authorized?
      return true if context[:true_user].admin?

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve
      context[:stop_impersonating_user].call
      { success: true }
    end
  end
end
