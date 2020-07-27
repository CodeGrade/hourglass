# frozen_string_literal: true

module Mutations
  class DestroyGradingComment < BaseMutation
    argument :grading_comment_id, ID, required: true, loads: Types::GradingCommentType

    field :deleted_id, ID, null: false

    def authorized?(grading_comment:, **_args)
      return true if grading_comment.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(grading_comment:)
      GradingLock.transaction do
        require_my_lock!(grading_comment)
        destroyed = grading_comment.destroy
        raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless destroyed
      end

      { deleted_id: HourglassSchema.id_from_object(grading_comment, Types::GradingCommentType, context) }
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
