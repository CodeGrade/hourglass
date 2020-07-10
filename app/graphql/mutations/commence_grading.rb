# frozen_string_literal: true

module Mutations
  class CommenceGrading < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :success, Boolean, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      exam.finalize_registrations_that_have_run_out_of_time!
      exam.initialize_grading_locks!
      { success: true }
    end
  end
end
