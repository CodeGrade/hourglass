module Mutations
  class DestroyAnomaly < BaseMutation
    argument :anomaly_id, ID, required: true, loads: Types::AnomalyType

    field :deleted_id, ID, null: false

    def authorized?(anomaly:, **_args)
      exam = anomaly.exam
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

    def resolve(anomaly:)
      destroyed = anomaly.destroy
      raise GraphQL::ExecutionError, anomaly.errors.full_messages.to_sentence unless destroyed

      deleted_id = HourglassSchema.id_from_object(anomaly, Types::AnomalyType, context)
      exam_id = HourglassSchema.id_from_object(anomaly.exam, Types::ExamType, context)
      HourglassSchema.subscriptions.trigger(:anomaly_was_destroyed, { exam_id: exam_id }, deleted_id)
      { deleted_id: deleted_id }
    end
  end
end
