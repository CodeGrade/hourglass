# frozen_string_literal: true

module Mutations
  # Mutation to create a grading comment on a student's submission
  class CreateGradingComment < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType

    argument :preset_comment_id, ID, required: false, loads: Types::PresetCommentType

    argument :qnum, Integer, required: true
    argument :pnum, Integer, required: true
    argument :bnum, Integer, required: true

    argument :message, String, required: true
    argument :points, Float, required: true

    field :grading_comment, Types::GradingCommentType, null: false
    field :grading_comment_connection, Types::GradingCommentType.connection_type, null: false
    field :grading_comment_edge, Types::GradingCommentType.edge_type, null: false
    field :registration_id, ID, null: false
    field :preset_comment, Types::PresetCommentType, null: true
    def preset_comment
      RecordLoader.for(PresetComment).load(object.preset_comment_id)
    end

    def authorized?(registration:, **_args)
      return true if registration.course.all_staff.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      comment = mutate!(**args)
      reg = args[:registration]
      add = range_add(registration: reg, comment: comment)
      {
        grading_comment: comment,
        grading_comment_connection: add.connection,
        grading_comment_edge: add.edge,
        registration_id: HourglassSchema.id_from_object(reg, Types::RegistrationType, context),
      }
    end

    private

    def mutate!(**args)
      comment = build_comment(**args)
      GradingComment.transaction do
        require_my_lock!(**args)
        save_comment!(comment)
      end
      comment
    end

    def build_comment(registration:, qnum:, pnum:, bnum:, **args)
      ev = registration.exam_version
      question = ev.db_questions.find_by(index: qnum)
      part = question.parts.find_by(index: pnum)
      body_item = part.body_items.find_by(index: bnum)
      GradingComment.new(
        creator: context[:current_user], 
        registration: registration,
        question: question,
        part: part,
        body_item: body_item,
        **args,
      )
    end

    def require_my_lock!(registration:, qnum:, pnum:, **args)
      ev = registration.exam_version
      question = ev.db_questions.find_by(index: qnum)
      part = question.parts.find_by(index: pnum)
      lock = registration.grading_locks.find_by(
        registration: registration,
        question: question,
        part: part,
      )
      my_lock = lock&.grader == context[:current_user]
      raise GraphQL::ExecutionError, 'You do not have a lock for that part number.' unless my_lock
    end

    def save_comment!(comment)
      created = comment.save
      raise GraphQL::ExecutionError, comment.errors.full_messages.to_sentence unless created
    end

    def range_add(registration:, comment:)
      GraphQL::Relay::RangeAdd.new(
        parent: registration,
        collection: registration.grading_comments,
        item: comment,
        context: context,
      )
    end
  end
end
