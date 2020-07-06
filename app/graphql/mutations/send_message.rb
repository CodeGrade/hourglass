module Mutations
  class SendMessage < BaseMutation
    argument :recipient_id, ID, required: true
    argument :message, String, required: true

    field :errors, [String], null: false

    def authorized?(recipient_id:, **_args)
      obj = HourglassSchema.object_from_id(recipient_id, context)
      exam = case obj
             when Exam
               obj
             when ExamVersion
               obj.exam
             when Room
               obj.exam
             when Registration
               obj.exam
             else
               return false, { errors: ['Invalid recipient.'] }
             end
      return true if ProctorRegistration.find_by(
        user: context[:current_user],
        exam: exam,
      )
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      [false, { errors: ['You do not have permission.'] }]
    end

    def resolve(recipient_id:, message:)
      obj = HourglassSchema.object_from_id(recipient_id, context)
      case obj
      when Exam
        msg = ExamAnnouncement.new(exam: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: HourglassSchema.id_from_object(obj, Types::ExamType, context) },
          obj,
        )
      when ExamVersion
        msg = VersionAnnouncement.new(exam_version: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: HourglassSchema.id_from_object(obj.exam, Types::ExamType, context) },
          obj.exam,
        )
      when Room
        msg = RoomAnnouncement.new(room: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: HourglassSchema.id_from_object(obj.exam, Types::ExamType, context) },
          obj.exam,
        )
      when Registration
        msg = Message.new(sender: context[:current_user], registration: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(
          :message_was_sent,
          { exam_id: HourglassSchema.id_from_object(obj.exam, Types::ExamType, context) },
          obj.exam,
        )
      else
        return {
          errors: ['Invalid message recipient.']
        }
      end
      {
        errors: [],
      }
    end
  end
end
