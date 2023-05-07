# frozen_string_literal: true

module Types
  class BaseField < GraphQL::Schema::Field
    argument_class Types::BaseArgument
    def guard(proc)
      @guard_proc = proc
    end

    def authorized?(obj, args, ctx)
      return true unless @guard_proc

      wrapped = Types::GuardWrapper.new(self, obj)
      answer = @guard_proc.call(wrapped, args, ctx)
      return true if answer

      raise GraphQL::ExecutionError, "Not authorized to access #{self.owner_type.graphql_name}.#{self.graphql_name}."
    end
  end
end
