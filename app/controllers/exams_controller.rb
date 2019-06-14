class ExamsController < ApplicationController
  before_action :require_current_user
  before_action :require_enabled, except: [:index]
  before_action :require_registration, except: [:index]

  def require_enabled
    @exam = Exam.find(params[:id])
    unless @exam.enabled?
      redirect_back fallback_location: exams_path, alert: 'This exam has not been enabled yet.'
      return
    end
  end

  def require_registration
    @registration = Registration.find_by(user: current_user, exam_id: params[:id])
    if @registration.nil?
      redirect_back fallback_location: exams_path, alert: 'You are not registered for that exam.'
      return
    end
  end

  def show
    if @registration.admin?
      render 'admin'
      return
    end

    @submission = Submission.find_by(user: current_user, exam: @exam)
    if @submission && @submission.final?
      render 'submit'
      return
    end
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map(&:exam)
    @exams.keep_if(&:enabled?)
  end

  def save_answers(final = false)
    answers = params.require(:answers).permit(question: {}).to_h[:question]
    @exam = Exam.find(params[:id])
    sub = Submission.find_or_initialize_by(user: current_user, exam: @exam)
    if sub.final? || sub.anomalous?
      return true
    end
    sub.final = final
    sub.save_answers(answers)
    sub.save!
    return false
  end

  def submit
    lockout = save_answers(true)
    if lockout
      redirect_to exams_path, alert: "You have already submitted that exam."
    end
  end

  def save_snapshot
    lockout = save_answers
    render json: {lockout: lockout}
  end
end
