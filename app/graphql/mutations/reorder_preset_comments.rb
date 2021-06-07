# frozen_string_literal: true

module Mutations
  class ReorderPresetComments < BaseMutation
    argument :rubric_preset_id, ID, required: true, loads: Types::RubricPresetType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true

    field :rubric_preset, Types::RubricPresetType, null: false

    def authorized?(rubric_preset:, **_kwargs)
      return true if rubric_preset.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric_preset:, from_index:, to_index:)
      rubric_preset.move_preset_comments(from_index, to_index)

      { rubric_preset: rubric_preset }
    end
  end
end
