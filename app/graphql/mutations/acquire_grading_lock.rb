# frozen_string_literal: true

module Mutations
  class AcquireGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true

    field :acquired, Boolean, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:)
      GradingLock.transaction do
        ev = registration.exam_version
        question = ev.db_questions.find_by(index: qnum)
        part = question.parts.find_by(index: pnum)
        lock = registration.grading_locks.find_or_initialize_by(registration: registration, question: question, part: part)
        raise GraphQL::ExecutionError, 'That part is already being graded.' if lock&.grader

        lock.grader = context[:current_user]
        lock.save!
      end
      { acquired: true }
    end
  end
end
