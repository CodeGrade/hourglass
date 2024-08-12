# frozen_string_literal: true

module Mutations
  class PostponeGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :notes, String, required: true

    field :released, Boolean, null: false
    field :grading_lock, Types::GradingLockType, null: false

    def authorized(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:, notes:)
      GradingLock.transaction do
        ev = registration.exam_version
        question = ev.db_questions.find_by(index: qnum)
        part = question.parts.find_by(index: pnum)
        lock = registration.grading_locks.find_by(registration: registration, question: question, part: part)
        raise GraphQL::ExecutionError, 'That part is not being graded.' unless lock

        raise GraphQL::ExecutionError, 'Must leave a non-empty note when postponing grading.' if notes.blank?

        check_permissions_for_lock(context[:current_user], lock)

        updated = lock.update(notes: notes)
        raise GraphQL::ExecutionError, lock.errors.full_messages.to_sentence unless updated
      
        HourglassSchema.subscriptions.trigger(
          :grading_lock_updated,
          { exam_id: HourglassSchema.id_from_object(ev.exam, Types::ExamType, nil) },
          lock,
        )
        { released: false, grading_lock: lock }
      end
    end

    private
    
    def check_permissions_for_lock(user, lock)
      owns_lock = lock.grader == user
      return if owns_lock

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end
  end
end