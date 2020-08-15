# frozen_string_literal: true

module Mutations
  # Mutation to create a single preset comment
  class CreatePresetComment < BaseMutation
    argument :rubric_preset_id, ID, required: true, loads: Types::RubricPresetType
    argument :label, String, required: false
    argument :grader_hint, String, required: true
    argument :student_feedback, String, required: false
    argument :points, Float, required: true
    argument :order, Integer, required: false

    field :preset_comment, Types::PresetCommentType, null: false

    def authorized?(rubric_preset:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: rubric_preset.exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      preset_comment = PresetComment.new(args)
      saved = preset_comment.save
      raise GraphQL::ExecutionError, preset_comment.errors.full_messages,to_sentence unless saved

      { preset_comment: preset_comment }
    end
  end
end
