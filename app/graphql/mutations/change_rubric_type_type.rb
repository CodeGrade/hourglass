module Mutations
  class ChangeRubricTypeType < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType
    argument :type, Types::RubricVariantType, required: true

    field :rubric, Types::RubricType, null: false

    def authorized?(rubric:, **_args)
      return true if rubric.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric:, type:)
      exam_version = rubric.exam_version
      rubric = rubric.change_type(type)

      cache_authorization!(exam_version.exam, exam_version.exam.course)
      { rubric: rubric }
    end
  end
end
