# frozen_string_literal: true

module Mutations
  # Mutation to finalize a student's exam submission
  class FinalizeItem < BaseMutation
    argument :id, ID, required: true
    argument :scope, String, required: false

    field :exam, Types::ExamType, null: true

    def authorized?(id:, **_args)
      obj = HourglassSchema.object_from_id(id, context)
      exam = exam_for_obj(obj)
      raise GraphQL::ExecutionError, 'Invalid target.' unless exam
      return true if exam.user_is_proctor?(context[:current_user])
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(id:, scope: nil)
      obj = HourglassSchema.object_from_id(id, context)
      if obj.is_a?(Exam) && scope == 'out_of_time'
        obj.finalize_registrations_that_have_run_out_of_time!
      else
        obj.finalize!
      end
      exam = exam_for_obj(obj)

      cache_authorization!(exam, exam.course)
      { exam: exam }
    end

    private

    def exam_for_obj(obj)
      case obj
      when Exam
        obj
      when ExamVersion, Room, Registration
        obj.exam
      else
        raise GraphQL::ExecutionError, 'Invalid finalization target'
      end
    end
  end
end
