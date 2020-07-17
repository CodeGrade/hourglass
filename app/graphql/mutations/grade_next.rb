# frozen_string_literal: true

module Mutations
  class GradeNext < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :registration_id, ID, null: false
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      GradingLock.transaction do
        sorted = exam.grading_locks.incomplete.no_grader.sort_by { |l| [l.qnum, l.pnum] }
        raise GraphQL::ExecutionError, 'No submissions need grading.' if sorted.empty?

        lock = sorted.first
        updated = lock.update(grader: context[:current_user])
        raise GraphQL::ExecutionError, updated.errors.full_messages.to_sentence unless updated

        reg_id = HourglassSchema.id_from_object(lock.registration, Types::RegistrationType, context)
        { registration_id: reg_id, qnum: lock.qnum, pnum: lock.pnum }
      end
    end
  end
end
