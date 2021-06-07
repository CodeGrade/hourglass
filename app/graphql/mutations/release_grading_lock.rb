# frozen_string_literal: true

module Mutations
  class ReleaseGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :mark_complete, Boolean, required: false

    field :released, Boolean, null: false
    field :grading_lock, Types::GradingLockType, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:, mark_complete:)
      GradingLock.transaction do
        ev = registration.exam_version
        question = ev.db_questions.find_by(index: qnum)
        part = question.parts.find_by(index: pnum)
        lock = registration.grading_locks.find_by(registration: registration, question: question, part: part)
        raise GraphQL::ExecutionError, 'That part is not being graded.' unless lock

        check_permissions_for_lock(context[:current_user], lock, registration.course)

        updated = if mark_complete.nil?
                    lock.update(grader: nil)
                  elsif mark_complete
                    lock.update(grader: nil, completed_by: context[:current_user])
                  else
                    lock.update(grader: nil, completed_by: nil)
                  end
        raise GraphQL::ExecutionError, lock.errors.full_messages.to_sentence unless updated

        { released: true, grading_lock: lock }
      end
    end

    private

    def check_permissions_for_lock(user, lock, course)
      owns_lock = lock.grader == user
      return if owns_lock

      is_prof = course.professors.exists? user.id
      return if is_prof

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end
  end
end
