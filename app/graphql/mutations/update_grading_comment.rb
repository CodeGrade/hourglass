# frozen_string_literal: true

module Mutations
  class UpdateGradingComment < BaseMutation
    argument :grading_comment_id, ID, required: true, loads: Types::GradingCommentType

    argument :message, String, required: true
    argument :points, Float, required: true

    field :grading_comment, Types::GradingCommentType, null: false
    def preset_comment
      RecordLoader.for(PresetComment).load(object.preset_comment_id)
    end

    def authorized?(grading_comment:, **_args)
      return true if grading_comment.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(grading_comment:, **args)
      GradingLock.transaction do
        require_my_lock!(grading_comment)
        updated = grading_comment.update(args)
        raise GraphQL::ExecutionError, grading_comment.errors.full_messages.to_sentence unless updated
      end

      { grading_comment: grading_comment }
    end

    private

    def require_my_lock!(grading_comment)
      reg = grading_comment.registration
      lock = reg.grading_locks.find_by(registration: reg, qnum: grading_comment.qnum, pnum: grading_comment.pnum)
      my_lock = lock&.grader == context[:current_user]
      raise GraphQL::ExecutionError, 'You do not have a lock for that part number.' unless my_lock
    end
  end
end
