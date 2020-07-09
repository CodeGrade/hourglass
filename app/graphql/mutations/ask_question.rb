# frozen_string_literal: true

module Mutations
  class AskQuestion < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType
    argument :body, String, required: true

    field :question, Types::QuestionType, null: false
    field :questions_connection, Types::QuestionType.connection_type, null: false
    field :question_edge, Types::QuestionType.edge_type, null: false

    def authorized?(registration:, **_args)
      return true if registration.user == context[:current_user]

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:, body:)
      q = Question.new(registration: registration, body: body)
      saved = q.save
      raise GraphQL::ExecutionError, q.errors_full_messages.to_sentence unless saved

      range_add = GraphQL::Relay::RangeAdd.new({
        parent: registration, collection: registration.questions, item: q, context: context
      })

      { question: q, questions_connection: range_add.connection, question_edge: range_add.edge }
    end
  end
end
