# frozen_string_literal: true

module Mutations
  class ReorderBodyItems < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true

    field :part, Types::PartType, null: false

    def authorized?(part:, **_kwargs)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, from_index:, to_index:)
      part.move_body_items(from_index, to_index)

      { part: part }
    end
  end
end
