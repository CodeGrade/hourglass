# frozen_string_literal: true

module Mutations
  class RequestGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    
    field :acquired, Boolean, null: false
    field :current_owner, Types::UserType, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:)
      GradingLock.transaction do
        lock = registration.grading_locks.find_by(registration: registration, qnum: qnum, pnum: pnum)
        raise GraphQL::ExecutionError, 'That part is not being graded.' unless lock

        if lock.grader
          return { acquired: false, current_owner: lock.grader }
        else
          updated = lock.update(grader: context[:current_user], completed_by: nil)
          raise GraphQL::ExecutionError, lock.errors.full_messages.to_sentence unless updated

          { acquired: true, current_owner: lock.grader }
        end
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
