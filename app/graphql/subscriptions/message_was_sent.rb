class Subscriptions::MessageWasSent < Subscriptions::BaseSubscription
  argument :exam_id, ID, required: true, loads: Types::ExamType

  payload_type Types::ExamType

  def authorized?(exam:)
    reg = ProctorRegistration.find_by(
      user: context[:current_user],
      exam: exam,
    )
    return true if reg
    prof_reg = ProfessorCourseRegistration.find_by(
      user: context[:current_user],
      course: exam.course,
    )
    return true if prof_reg
    return false, { errors: ['You do not have permission.'] }
  end

  def subscribe(exam:)
    exam
  end
end
