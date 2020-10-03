# frozen_string_literal: true

module Mutations
  class GradeNext < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :qnum, Integer, required: false
    argument :pnum, Integer, required: false

    field :registration_id, ID, null: false
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, qnum: nil, pnum: nil)
      GradingLock.transaction do
        lock = my_currently_grading(exam) || next_incomplete(exam, qnum, pnum)

        raise GraphQL::ExecutionError, 'No submissions need grading.' unless lock

        updated = lock.update(grader: context[:current_user])
        raise GraphQL::ExecutionError, updated.errors.full_messages.to_sentence unless updated

        reg_id = HourglassSchema.id_from_object(lock.registration, Types::RegistrationType, context)
        { registration_id: reg_id, qnum: lock.qnum, pnum: lock.pnum }
      end
    end

    private

    def my_currently_grading(exam)
      exam.grading_locks.where(grader: context[:current_user]).incomplete.first
    end

    def next_incomplete(exam, qnum, pnum)
      sorted = exam.grading_locks.incomplete.no_grader
      sorted = sorted.where(qnum: qnum) if qnum && sorted.where(qnum: qnum).exists?
      sorted = sorted.where(pnum: pnum) if pnum && sorted.where(pnum: pnum).exists?
      sorted = sorted.sort_by { |l| [l.qnum, l.pnum] }
      sorted.first
    end
  end
end
