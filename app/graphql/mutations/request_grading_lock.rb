# frozen_string_literal: true

module Mutations
  class RequestGradingLock < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :steal, Boolean, required: false, default_value: false
    
    field :acquired, Boolean, null: false
    field :current_owner, Types::UserType, null: false

    def authorized?(registration:, steal:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id
      return true if (steal && registration.course.professors.exists?(context[:current_user].id))

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, qnum:, pnum:, steal:)
      GradingLock.transaction do
        ev = registration.exam_version
        question = ev.db_questions.find_by(index: qnum)
        part = question.parts.find_by(index: pnum)
        lock = registration.grading_locks.find_by(registration: registration, question: question, part: part)
        raise GraphQL::ExecutionError, 'That part is not being graded.' unless lock

        if steal && registration.course.professors.exists?(context[:current_user].id)
          lock.grader = nil
        end

        if lock.grader
          return { acquired: false, current_owner: lock.grader }
        else
          updated = lock.update(grader: context[:current_user], completed_by: nil)
          raise GraphQL::ExecutionError, lock.errors.full_messages.to_sentence unless updated

          { acquired: true, current_owner: lock.grader }
        end
      end
    end
  end
end
