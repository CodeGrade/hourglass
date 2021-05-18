module Mutations
  class ChangeRubricPresetDetails < BaseMutation
    argument :rubric_preset_id, ID, required: true, loads: Types::RubricPresetType
    argument :label, String, required: false
    argument :update_label, Boolean, required: true
    argument :direction, Types::RubricDirectionType, required: false
    argument :update_direction, Boolean, required: true

    field :rubric_preset, Types::RubricPresetType, null: false

    def authorized?(rubric_preset:, **_args)
      return true if rubric_preset.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric_preset:, update_label:, update_direction:, label: nil, direction: nil)
      rubric_preset.label = label if update_label
      rubric_preset.direction = direction if update_direction
      rubric_preset.save!

      { rubric_preset: rubric_preset }
    end
  end
end
