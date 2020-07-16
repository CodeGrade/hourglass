# frozen_string_literal: true

module Mutations
  class CreateGradingCheck < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType

    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :bnum, Integer, required: true

    argument :points, Float, required: true

    field :created, Boolean, null: false

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      GradingCheck.transaction do
        require_my_lock!(args)

        check = GradingCheck.new(args)
        created = check.save
        raise GraphQL::ExecutionError, check.errors.full_messages.to_sentence unless created
      end

      { created: true }
    end

    private

    def require_my_lock!(**args)
      lock = args[:registration].grading_locks.find_by(args.slice(:registration, :qnum, :pnum))
      my_lock = lock&.grader == context[:current_user]
      raise GraphQL::ExecutionError, 'You do not have a lock for that part number.' unless my_lock
    end
  end
end
