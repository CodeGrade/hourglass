# frozen_string_literal: true

module Mutations
  class DestroyPresetComment < BaseMutation
    argument :preset_comment_id, ID, required: true, loads: Types::PresetCommentType

    field :rubric, Types::RubricType, null: false

    def authorized?(preset_comment:)
      return true if preset_comment.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(preset_comment:)
      Rubric.transaction do
        rubric_preset = preset_comment.rubric_preset
        order = preset_comment.order
        rubric = rubric_preset.rubric
        destroyed = preset_comment.destroy
        raise GraphQL::ExecutionError, preset_comment.errors.full_messages.to_sentence unless destroyed

        rubric_preset.reload
        if rubric_preset.preset_comments.empty?
          rubric_preset.destroy
        else
          rubric_preset.preset_comments.where(order: order..).order(:order).each do |comment|
            comment.update(order: comment.order - 1)
          end
        end

        { rubric: rubric }
      end
    end
  end
end
