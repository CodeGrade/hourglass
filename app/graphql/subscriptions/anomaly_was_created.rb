class Subscriptions::AnomalyWasCreated < Subscriptions::BaseSubscription
  argument :exam_rails_id, Integer, required: true

  field :anomaly, Types::AnomalyType, null: true
  field :anomaliesConnection, Types::AnomalyType.connection_type, null: true
  field :anomalyEdge, Types::AnomalyType.edge_type, null: true

  def authorized?(exam_rails_id:)
    exam = Exam.find_by!(id: exam_rails_id)
    return true if ProctorRegistration.find_by(
      user: context[:current_user],
      exam: exam,
    )
    return true if ProfessorCourseRegistration.find_by(
      user: context[:current_user],
      course: exam.course,
    )

    raise GraphQL::ExecutionError, 'You do not have permission.'
  end

  def update(exam_rails_id:)
    exam = Exam.find_by(id: exam_rails_id)
    raise GraphQL::ExecutionError, 'Invalid exam.' unless exam

    range_add = GraphQL::Relay::RangeAdd.new(
      parent: exam,
      collection: exam.anomalies,
      item: object,
      context: context,
    )

    {
      anomaly: object,
      anomaliesConnection: range_add.connection,
      anomalyEdge: range_add.edge,
    }
  end
end
