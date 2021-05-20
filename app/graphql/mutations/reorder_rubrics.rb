# frozen_string_literal: true

module Mutations
  class ReorderRubrics < BaseMutation
    argument :parent_section_id, ID, required: true, loads: Types::RubricType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true

    field :rubric, Types::RubricType, null: false

    def authorized?(parent_section:, **_kwargs)
      return true if parent_section.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(parent_section:, from_index:, to_index:)
      parent_section.move_subsections(from_index, to_index)

      { rubric: parent_section }
    end
  end
end
