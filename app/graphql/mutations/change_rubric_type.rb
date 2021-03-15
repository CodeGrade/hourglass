module Mutations
  class ChangeRubricType < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType
    argument :type, Types::RubricVariantType, required: true

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(rubric:, **_args)
      return true if rubric.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric:, type:)
      exam_version = rubric.exam_version
      rubric.change_type(type: type)
      exam_version.reload

      cache_authorization!(exam_version.exam, exam_version.exam.course)
      { exam_version: exam_version }
    end
  end
end
