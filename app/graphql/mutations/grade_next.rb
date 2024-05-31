# frozen_string_literal: true

module Mutations
  class GradeNext < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :exam_version_id, ID, required: false, loads: Types::ExamVersionType
    argument :qnum, Integer, required: false
    argument :pnum, Integer, required: false
    argument :allow_change_problems, Boolean, required: false

    field :registration_id, ID, null: false
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false
    field :notes, String, null: false

    def authorized?(exam:, **_args)
      return true if exam.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, exam_version: nil, qnum: nil, pnum: nil, allow_change_problems: false)
      GradingLock.transaction do
        # Ideally, a grader will grade new submissions for the current qnum/pnum,
        # then finish any postponed submissions for the current qnum/pnum,
        # before moving on to the next qnum/pnum.

        # We'll only query for a new incomplete submission if you have no current active locks.
        
        my_next_locks = my_currently_grading(exam)

        my_next_incomplete = my_next_locks[:active].nil? && next_incomplete(exam, exam_version, qnum, pnum)

        # if you didn't specify a preference, then you can't object to changing problems
        no_preference = exam_version.nil? || qnum.nil? || pnum.nil?

        changed = my_next_incomplete && 
                  !(my_next_incomplete[:same_version] &&
                    my_next_incomplete[:same_question] &&
                    my_next_incomplete[:same_part])

        if my_next_locks[:active]
          # always prefer active locks
          lock = my_next_locks[:active]
        elsif my_next_incomplete[:lock]
          if changed && my_next_locks[:postponed]
            # prefer not to change problems yet
            lock = my_next_locks[:postponed]
          else
            # prefer incomplete problems before postponed ones
            lock = my_next_incomplete[:lock]
          end
        else
          # if there's nothing else remaining, try the postponed ones
          lock = my_next_locks[:postponed]
        end

        if !allow_change_problems && !no_preference && changed && (lock == my_next_incomplete[:lock])
          submission_type = 'part' unless my_next_incomplete[:same_part]
          submission_type = 'question' unless my_next_incomplete[:same_question]
          submission_type = 'exam version' unless my_next_incomplete[:same_version]
          raise GraphQL::ExecutionError.new(
            "There are no more submissions for that #{submission_type}",
            extensions: { anyRemaining: my_next_incomplete[:more] }
          )
        elsif lock.nil?
          raise GraphQL::ExecutionError.new(
            'No submissions need grading', 
            extensions: { anyRemaining: false },
          )
        end

        updated = lock.update(grader: context[:current_user])
        raise GraphQL::ExecutionError.new(
          lock.errors.full_messages.to_sentence,
          extensions: { anyRemaining: true },
         ) unless updated

        HourglassSchema.subscriptions.trigger(
          :grading_lock_updated,
          { exam_id: HourglassSchema.id_from_object(exam, Types::ExamType, nil) },
          lock,
        )
        reg_id = HourglassSchema.id_from_object(lock.registration, Types::RegistrationType, context)
        {
          registration_id: reg_id,
          qnum: lock.question.index,
          pnum: lock.part.index,
          notes: lock.notes
        }
      end
    end

    private

    def my_currently_grading(exam)
      active, postponed = exam.grading_locks
        .includes(:question, :part)
        .where(grader: context[:current_user])
        .incomplete
        .partition{|gl| gl.notes.blank?}
      {
        active: active.min_by { |gl| [gl.question.index, gl.part.index] },
        postponed: postponed.min_by { |gl| [gl.question.index, gl.part.index, gl.notes] }
      }
    end

    def next_incomplete(exam, exam_version, qnum, pnum)
      sorted = exam.grading_locks.includes(:question, :part).incomplete.no_grader.to_a
      # If no particular preference was made, assume everything is the same
      same_version = exam_version.nil?
      same_question = qnum.nil?
      same_part = pnum.nil?
      if (exam_version && (exam_version.exam == exam))
        reg_ids = exam_version.registration_ids.to_set
        for_cur_version = sorted.select { |s| reg_ids.member?(s.registration_id) } 
        unless for_cur_version.empty?
          same_version = true
          sorted = for_cur_version 
          by_qnum = qnum ? sorted.select { |s| s.question.index == qnum } : []
          unless by_qnum.empty?
            same_question = true
            sorted = by_qnum
            by_pnum = pnum ? sorted.select { |s| s.part.index == pnum } : []
            unless by_pnum.empty?
              same_part = true
              sorted = by_pnum
            end
          end
        end
      end
      {
        lock: sorted.min_by { |gl| [gl.question.index, gl.part.index] },
        same_version: same_version,
        same_question: same_question,
        same_part: same_part,
        more: !sorted.empty?
      }
    end
  end
end
