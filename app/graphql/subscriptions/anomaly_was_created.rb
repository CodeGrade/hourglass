class Subscriptions::AnomalyWasCreated < Subscriptions::BaseSubscription
  # argument :exam_id, ID, required: true, loads: Types::ExamType
  argument :exam_rails_id, Integer, required: true

  payload_type Types::ExamType

  def authorized?(exam_rails_id:)
    exam = Exam.find_by!(id: exam_rails_id)
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

  def subscribe(exam_rails_id:)
    exam = Exam.find_by!(id: exam_rails_id)
    exam
  end
end
