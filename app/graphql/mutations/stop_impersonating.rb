# frozen_string_literal: true

module Mutations
  class StopImpersonating < BaseMutation
    field :success, Boolean, null: false

    def authorized?
      return true if context[:true_user] != context[:current_user]

      raise GraphQL::ExecutionError, 'You are not currently impersonating another user.'
    end

    def resolve
      context[:stop_impersonating_user].call
      { success: true }
    end
  end
end
