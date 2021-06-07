# frozen_string_literal: true

module Mutations
  # Mutation to create a single rubric preset
  class CreateRubricPreset < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType
    argument :direction, String, required: true
    argument :label, String, required: false
    argument :mercy, Float, required: false

    field :rubric, Types::RubricType, null: false

    def authorized?(rubric:, **_args)
      return true if rubric.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      RubricPreset.transaction do
        rubric_preset = RubricPreset.new(args)
        saved = rubric_preset.save
        raise GraphQL::ExecutionError, rubric_preset.errors.full_messages.to_sentence unless saved

        preset_comment = PresetComment.new(rubric_preset: rubric_preset, grader_hint: '', points: 0, order: 0)
        saved = preset_comment.save
        raise GraphQL::ExecutionError, preset_comment.errors.full_messages.to_sentence unless saved

        { rubric: rubric_preset.rubric }
      end
    end
  end
end
