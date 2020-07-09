class Subscriptions::MessageWasSent < Subscriptions::BaseSubscription
  argument :exam_id, ID, required: true, loads: Types::ExamType

  # TODO: just send the message and edge
  payload_type Types::ExamType

  def authorized?(exam:)
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

  def subscribe(exam:)
    exam
  end
end
