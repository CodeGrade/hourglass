# frozen_string_literal: true

module Mutations
  class ChangeRubricDetails < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType

    argument :points, Float, required: false
    argument :update_points, Boolean, required: false, default_value: false

    argument :description, String, required: false
    argument :update_description, Boolean, required: false, default_value: false

    field :rubric, Types::RubricType, null: false

    def authorized?(rubric:, **_args)
      return true if rubric.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric:, update_points:, update_description:, points: nil, description: nil)
      rubric.description = description if update_description
      rubric.points = points if update_points
      saved = rubric.save
      raise GraphQL::ExecutionError, rubric.errors.full_messages.to_sentence unless saved

      { rubric: rubric }
    end
  end
end
