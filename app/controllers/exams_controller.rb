class ExamsController < ApplicationController
  before_action :require_current_user
  before_action :require_enabled, except: [:index, :new, :create]
  before_action :require_registration, except: [:index, :new, :create]
  before_action :require_admin_or_prof, only: [:new, :create]
  before_action :check_anomaly, only: [:show, :contents]

  def require_enabled
    @exam ||= Exam.find(params[:id])
    unless @exam.enabled?
      redirect_back fallback_location: exams_path, alert: 'This exam has not been enabled yet.'
    end
  end

  def require_registration
    @registration ||= Registration.find_by(user: current_user, exam_id: params[:id])
    if @registration.nil?
      redirect_back fallback_location: exams_path, alert: 'You are not registered for that exam.'
    end
  end

  def check_anomaly
    if @registration.anomalous?
      redirect_back fallback_location: exams_path, alert: "You are locked out of that exam. Please see a proctor."
    end
  end

  def show
    if @registration.final?
      render 'submit'
      return
    end
  end

  def contents
    # TODO make secret in "show" and check it before rendering
    #   so that users cannot just visit /exams/1/contents
    @answers = @registration.get_current_answers
    render layout: false
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
      redirect_to exams_path, alert: "You have already submitted this exam or you are locked out of it."
    end
  end

  def save_snapshot
    lockout = save_answers
    render json: {lockout: lockout}
  end

  def anomaly_detected
    @registration.update_attribute(:anomalous, true)
    reason = params.require(:reason)
    # TODO something useful with `reason`
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
    Registration.create(exam: @exam, user: current_user, role: current_user.role.to_s)
    redirect_to @exam
  end
end
