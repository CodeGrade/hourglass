# frozen_string_literal: true

module Mutations
  # Mutation to create a single preset comment
  class CreatePresetComment < BaseMutation
    argument :rubric_preset_id, ID, required: true, loads: Types::RubricPresetType
    argument :label, String, required: false
    argument :grader_hint, String, required: true
    argument :student_feedback, String, required: false
    argument :points, Float, required: true

    field :rubric_preset, Types::RubricPresetType, null: false

    def authorized?(rubric_preset:, **_args)
      return true if rubric_preset.exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      order = args[:rubric_preset]&.preset_comments&.count || 0
      preset_comment = PresetComment.new(order: order, **args)
      saved = preset_comment.save
      raise GraphQL::ExecutionError, preset_comment.errors.full_messages.to_sentence unless saved

      { rubric_preset: preset_comment.rubric_preset }
    end
  end
end
