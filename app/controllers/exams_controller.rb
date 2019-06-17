class ExamsController < ApplicationController
  before_action :require_current_user
  before_action :require_enabled, except: [:index, :new, :create]
  before_action :require_registration, except: [:index, :new, :create]
  before_action :require_admin_or_prof, only: [:new, :create]

  def require_enabled
    @exam ||= Exam.find(params[:id])
    unless @exam.enabled?
      redirect_back fallback_location: exams_path, alert: 'This exam has not been enabled yet.'
      return
    end
  end

  def require_registration
    @registration ||= Registration.find_by(user: current_user, exam_id: params[:id])
    if @registration.nil?
      redirect_back fallback_location: exams_path, alert: 'You are not registered for that exam.'
      return
    end
  end

  def show
    if @registration.final?
      render 'submit'
      return
    end

    @answers = @registration.get_current_answers
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map(&:exam)
    @exams.keep_if(&:enabled?)
  end

  def save_answers(final = false)
    answers = params.require(:answers).permit(question: {}).to_h[:question]
    if @registration.final? || @registration.anomalous?
      return true
    end
    @registration.update_attribute(:final, final)
    @registration.save_answers(answers)
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

  def new
    @exam = Exam.new
  end

  def create
    exam_params = params.require(:exam).permit(:name, :yaml, :enabled)
    @exam = Exam.new
    uploaded_yaml = exam_params[:yaml]
    @exam.name = exam_params[:name]
    upload = Upload.new(upload_data: uploaded_yaml, user: current_user, exam: @exam)
    @exam.upload = upload
    @exam.enabled = exam_params[:enabled]
    upload.save!
    @exam.save!
    redirect_to exams_path
  end
end
