class Subscriptions::MessageWasSent < Subscriptions::BaseSubscription
  argument :exam_id, ID, required: true, loads: Types::ExamType

  # TODO: just send the message and edge
  payload_type Types::ExamType

  def authorized?(exam:)
    return true if exam.students.or(exam.proctors).or(exam.professors).exists? context[:current_user].id

    raise GraphQL::ExecutionError, 'You do not have permission.'
  end

  def subscribe(exam:)
    exam
  end
end
