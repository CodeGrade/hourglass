# frozen_string_literal: true

module Mutations
  # Mutation to eliminate a student's exam anomaly
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
      Anomaly.transaction do
        updated = anomaly.update(forgiven: true)
        raise GraphQL::ExecutionError, "Unable to forgive anomaly: #{anomaly.errors.full_messages.to_sentence}" unless updated
        msg = Message.new(
          sender: context[:current_user], 
          registration: anomaly.registration, 
          body: "You have been let back into the exam: please refresh this page to resume your exam."
        )
        saved = msg.save
        raise GraphQL::ExecutionError, "Unable to notify student: #{msg.errors.full_messages.to_sentence}" unless saved

        deleted_id = HourglassSchema.id_from_object(anomaly, Types::AnomalyType, context)
        exam_id = HourglassSchema.id_from_object(anomaly.exam, Types::ExamType, context)
        HourglassSchema.subscriptions.trigger(:anomaly_was_destroyed, { exam_id: exam_id }, deleted_id)
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: exam_id, },
          msg,
        )
        HourglassSchema.subscriptions.trigger(
          :message_received,
          { registration_id: HourglassSchema.id_from_object(msg.registration, Types::RegistrationType, context) },
          msg,
        )
        
        { deleted_id: deleted_id }
      end
    end
  end
end
