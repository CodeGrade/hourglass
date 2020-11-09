# frozen_string_literal: true

module Mutations
  class ReleaseAllGradingLocks < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :released, Boolean, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      exam.initialize_grading_locks!(reset: true)
      { released: true }
    end
  end
end
