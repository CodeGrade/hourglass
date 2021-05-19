module Mutations
  class ChangeRubricPresetDetails < BaseMutation
    argument :rubric_preset_id, ID, required: true, loads: Types::RubricPresetType

    argument :label, String, required: false
    argument :update_label, Boolean, required: false, default_value: false

    argument :direction, Types::RubricDirectionType, required: false
    argument :update_direction, Boolean, required: false, default_value: false

    field :rubric_preset, Types::RubricPresetType, null: false

    def authorized?(rubric_preset:, **_args)
      return true if rubric_preset.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric_preset:, update_label:, update_direction:, label: nil, direction: nil)
      rubric_preset.label = label if update_label
      rubric_preset.direction = direction if update_direction
      saved = rubric_preset.save
      raise GraphQL::ExecutionError, rubric_preset.errors.full_messages.to_sentence unless saved

      { rubric_preset: rubric_preset }
    end
  end
end
