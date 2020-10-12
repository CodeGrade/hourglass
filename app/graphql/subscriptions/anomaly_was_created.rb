# frozen_string_literal: true

module Subscriptions
  class AnomalyWasCreated < Subscriptions::BaseSubscription
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :anomaly, Types::AnomalyType, null: false
    field :anomalies_connection, Types::AnomalyType.connection_type, null: false
    field :anomaly_edge, Types::AnomalyType.edge_type, null: false

    def authorized?(exam:)
      return true if exam.user_is_proctor?(context[:current_user])
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def update(exam:)
      range_add = GraphQL::Relay::RangeAdd.new(parent: exam, collection: exam.anomalies, item: object, context: context)

      {
        anomaly: object,
        anomalies_connection: range_add.connection,
        anomaly_edge: range_add.edge,
      }
    end
  end
end
