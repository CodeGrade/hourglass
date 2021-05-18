# frozen_string_literal: true

module Mutations
  class ChangeRubricDetails < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType
    argument :points, Float, required: false
    argument :update_points, Boolean, required: true
    argument :update_description, Boolean, required: true
    argument :description, String, required: false

    field :rubric, Types::RubricType, null: false

    def authorized?(rubric:, **_args)
      return true if rubric.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric:, update_points:, update_description:, points: nil, description: nil)
      exam_version = rubric.exam_version
      rubric.description = description if update_description
      rubric.points = points if update_points
      rubric.save!

      cache_authorization!(exam_version.exam, exam_version.exam.course)
      { rubric: rubric }
    end
  end
end
