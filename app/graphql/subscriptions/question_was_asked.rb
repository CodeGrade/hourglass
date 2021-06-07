# frozen_string_literal: true

module Subscriptions
  class QuestionWasAsked < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :student_question, Types::StudentQuestionType, null: false
    field :student_questions_edge, Types::StudentQuestionType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.proctors_and_professors.exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new(parent: exam, collection: exam.questions, item: object, context: context)
      {
        student_question: object,
        student_questions_edge: range_add.edge,
      }
    end
  end
end
