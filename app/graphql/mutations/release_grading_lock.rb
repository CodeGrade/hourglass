# frozen_string_literal: true

module Mutations
  class ReleaseGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :mark_complete, Boolean, required: false

    field :released, Boolean, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:, mark_complete:)
      GradingLock.transaction do
        lock = registration.grading_locks.find_by(registration: registration, qnum: qnum, pnum: pnum)
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
      end
      { released: true }
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
