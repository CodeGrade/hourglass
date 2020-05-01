class ExamsController < ApplicationController
  before_action :require_current_user, except: [:save_snapshot, :get_snapshot]
  prepend_before_action :catch_require_current_user, only: [:save_snapshot]
  before_action :require_enabled, except: [:index, :new, :create]
  before_action :require_registration, except: [:index, :new, :create, :save_snapshot]
  before_action :require_admin_or_prof, only: [:new, :create, :preview, :finalize]
  before_action :check_anomaly, only: [:show, :contents, :submit]
  before_action :check_final, only: [:show, :contents, :submit]

  def catch_require_current_user
    begin
      require_current_user
      @registration ||= Registration.find_by(user: current_user, exam_id: params[:id])
    rescue DoubleLoginException => e
      registration ||= Registration.find_by(user_id: e.user.id, exam_id: params[:id])
      if registration
        Anomaly.create(registration: registration, reason: e.message)
      end
      render json: { lockout: true, reason: e.message }
      return false
    end
  end

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
      redirect_to exams_path, alert: "You are locked out of that exam. Please see a proctor."
    end
  end

  def check_final
    return if @registration.professor?

    if @registration.final?
      redirect_back fallback_location: exams_path, alert: "You have already completed that exam."
    end
  end

  def show
  end

  def contents
    # TODO make secret in "show" and check it before rendering
    #   so that users cannot just visit /exams/1/contents
    render "contents", locals: { preview: false }
  end

  def preview
    render 'contents', locals: { preview: true }
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map(&:exam)
    @exams.keep_if(&:enabled?)
  end

  # returns true if lockout should occur
  def save_answers(final = false)
    answers = params.permit(:id, exam: {}, answers: {}).to_h[:answers]
    unless @registration.allow_submission?
      return true
    end

    @registration.update_attribute(:final, final)
    @registration.save_answers(answers)
    return false
  end

  def finalize
    @exam = Exam.find(params[:id])
    @exam.finalize!
    redirect_back fallback_location: exam_path(@exam)
  end

  def submit
    lockout = save_answers(true)
    if lockout
      redirect_to exams_path, alert: "You have already submitted this exam or you are locked out of it."
    end
  end

  def save_snapshot
    lockout = save_answers
    render json: { lockout: lockout }
  end

  def get_snapshot
    unless @registration.visible_to? current_user
      render json: { message: "There is no submission for that user." }
      return
    end
    answers = @registration.get_current_answers
    render json: { answers: answers }
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
