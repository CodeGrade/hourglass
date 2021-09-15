# frozen_string_literal: true

module Mutations
  class AskQuestion < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :body, String, required: true

    field :student_question, Types::StudentQuestionType, null: false
    field :student_questions_connection, Types::StudentQuestionType.connection_type, null: false
    field :student_question_edge, Types::StudentQuestionType.edge_type, null: false

    def authorized?(registration:, **_args)
      return true if registration.user == context[:current_user]

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, body:)
      q = StudentQuestion.new(registration: registration, body: body)
      saved = q.save
      raise GraphQL::ExecutionError, q.errors.full_messages.to_sentence unless saved

      trigger_subscription(registration.exam, q)

      range_add = GraphQL::Relay::RangeAdd.new(
        parent: registration,
        collection: registration.student_questions,
        item: q,
        context: context,
      )

      { student_question: q, student_questions_connection: range_add.connection, student_question_edge: range_add.edge }
    end

    private

    def trigger_subscription(exam, question)
      HourglassSchema.subscriptions.trigger(
        :question_was_asked,
        { exam_id: HourglassSchema.id_from_object(exam, Types::ExamType, context) },
        question,
      )
    end
  end
end
