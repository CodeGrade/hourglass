module Mutations
  class DestroyAnomaly < BaseMutation
    argument :anomaly_id, ID, required: true, loads: Types::AnomalyType

    field :errors, [String], null: false

    def resolve(anomaly:)
      exam = anomaly.exam
      anomaly.destroy!
      HourglassSchema.subscriptions.trigger(:anomaly_was_created, { exam_rails_id: exam.id }, exam)
      {
        errors: [],
      }
    end

    def authorized?(anomaly:, **args)
      exam = anomaly.exam
      return true if ProctorRegistration.find_by(
        user: context[:current_user],
        exam: exam,
      )
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )
      return false, { errors: ['You do not have permission.'] }
    end
  end
end
