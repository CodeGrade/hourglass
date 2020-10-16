# frozen_string_literal: true

module Mutations
  class GradeNext < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :exam_version_id, ID, required: false, loads: Types::ExamVersionType
    argument :qnum, Integer, required: false
    argument :pnum, Integer, required: false

    field :registration_id, ID, null: false
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, exam_version: nil, qnum: nil, pnum: nil)
      GradingLock.transaction do
        lock = my_currently_grading(exam) || next_incomplete(exam, exam_version, qnum, pnum)

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

    def next_incomplete(exam, exam_version, qnum, pnum)
      sorted = exam.grading_locks.incomplete.no_grader.to_a
      if (exam_version && exam_version.exam == exam)
        reg_ids = exam_version.registration_ids.to_set
        for_cur_version = sorted.select { |s| reg_ids.member?(s.registration_id) } 
        unless for_cur_version.empty?
          sorted = for_cur_version 
          by_qnum = qnum ? sorted.select { |s| s.qnum == qnum } : []
          unless by_qnum.empty?
            sorted = by_qnum
            by_pnum = pnum ? sorted.select { |s| s.pnum == pnum } : []
            unless by_pnum.empty?
              sorted = by_pnum
            end
          end
        end
      end
      sorted = sorted.sort_by { |gl| [gl.qnum, gl.pnum] }
      sorted.first
    end
  end
end
