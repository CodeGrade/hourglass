module Mutations
  class SendMessage < BaseMutation
    argument :recipient_id, ID, required: true
    argument :message, String, required: true

    field :errors, [String], null: false

    def resolve(recipient_id:, message:)
      pp "MESSAGE: #{message}"
      obj = HourglassSchema.object_from_id(recipient_id, context)
      case obj
      when Exam
        msg = ExamAnnouncement.new(exam: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: obj.id }, obj)
      when ExamVersion
        msg = VersionAnnouncement.new(exam_version: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: obj.exam.id }, obj.exam)
      when Room
        msg = RoomAnnouncement.new(room: obj, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: obj.exam.id }, obj.exam)
      when Registration
        msg = Message.new(exam: obj.exam, sender: context[:current_user], recipient: obj.user, body: message)
        msg.save!
        HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: obj.exam.id }, obj.exam)
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
