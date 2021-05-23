# frozen_string_literal: true

module Mutations
  class ReorderQuestions < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam_version:, **_kwargs)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:, from_index:, to_index:)
      exam_version.move_questions(from_index, to_index)

      { exam_version: exam_version }
    end
  end
end
