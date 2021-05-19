# frozen_string_literal: true

module Mutations
  # Mutation to create a single rubric preset
  class CreateRubricPreset < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType
    argument :direction, String, required: true
    argument :label, String, required: false
    argument :mercy, Float, required: false

    field :rubric_preset, Types::RubricPresetType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      rubric_preset = RubricPreset.new(args)
      saved = rubric_preset.save
      raise GraphQL::ExecutionError, rubric_preset.errors.full_messages.to_sentence unless saved

      { rubric_preset: rubric_preset }
    end
  end
end
