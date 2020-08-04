# frozen_string_literal: true

module Subscriptions
  class MessageWasSent < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :message, Types::MessageType, null: false
    field :messages_edge, Types::MessageType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.proctors.or(exam.professors).exists? context[:current_user].id

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: exam,
        collection: exam.messages,
        item: object,
        context: context
      )
      {
        message: object,
        messages_edge: range_add.edge,
      }
    end
  end
end
