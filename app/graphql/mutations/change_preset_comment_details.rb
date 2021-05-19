module Mutations
  class ChangePresetCommentDetails < BaseMutation
    argument :preset_comment_id, ID, required: true, loads: Types::PresetCommentType

    argument :label, String, required: false
    argument :update_label, Boolean, required: false, default_value: false

    argument :points, Float, required: false
    argument :update_points, Boolean, required: false, default_value: false

    argument :grader_hint, String, required: false
    argument :update_grader_hint, Boolean, required: false, default_value: false

    argument :student_feedback, String, required: false
    argument :update_student_feedback, Boolean, required: false, default_value: false

    field :preset_comment, Types::PresetCommentType, null: false

    def authorized?(preset_comment:, **_args)
      return true if preset_comment.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(preset_comment:, **kwargs)
      preset_comment.label = kwargs[:label] if kwargs[:update_label]
      preset_comment.points = kwargs[:points] if kwargs[:update_points]
      preset_comment.grader_hint = kwargs[:grader_hint] if kwargs[:update_grader_hint]
      preset_comment.student_feedback = kwargs[:student_feedback] if kwargs[:update_student_feedback]
      preset_comment.save!

      { preset_comment: preset_comment }
    end
  end
end
