class ExamsController < ApplicationController
  before_action :require_current_user, except: [:save_snapshot, :start]
  prepend_before_action :catch_require_current_user, only: [:save_snapshot]
  before_action :require_enabled, except: [:index, :new, :create]
  before_action :require_registration, except: [:index, :new, :create, :save_snapshot]
  before_action :require_admin_or_prof, only: [:new, :create, :finalize]
  before_action :check_anomaly, only: [:start, :submit, :ask_question]
  before_action :check_final, only: [:start, :submit, :ask_question]

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
      render(
        json: {
          type: 'ANOMALOUS'
        }
      )
    end
  end

  def check_final
    return if @registration.professor?

    if @registration.final?
      redirect_to exams_path, alert: "You have already completed that exam."
    end
  end

  def show
    @final = @registration.final?
  end

  def start
    unless @registration.visible_to? current_user
      render json: { message: "There is no submission for that user." }
      return
    end
    answers = @registration.get_current_answers
    render(
      json: {
        type: 'CONTENTS',
        exam: {
          questions: @exam.info['contents']['questions'],
          reference: @exam.info['contents']['reference'],
          instructions: @exam.info['contents']['instructions'],
          files: @exam.files
        },
        answers: answers,
        messages: messages,
        questions: questions
      }
    )
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map(&:exam)
    @exams.keep_if(&:enabled?)
  end

  def finalize
    @exam = Exam.find(params[:id])
    @exam.finalize!
    redirect_back fallback_location: exam_path(@exam)
  end

  def submit
    permitted = params.permit(:id, exam: {}, answers: {})
    answers = permitted[:answers].to_h
    lockout = save_answers(answers, true)
    render json: { lockout: lockout }
  end

  def save_snapshot
    permitted = params.permit(:id, :lastMessageId, exam: {}, answers: {})
    last_message_id = permitted[:lastMessageId]
    answers = permitted[:answers].to_h
    lockout = save_answers(answers)
    render({
      json: {
        lockout: lockout,
        messages: messages_after(last_message_id)
      }
    })
  end

  def ask_question
    em_params = params.require(:message).permit(:body)
    em = ExamMessage.new(
      exam: @exam,
      sender: current_user,
      recipient: nil,
      body: em_params[:body],
    )
    render json: {
      success: em.save,
      messages: em.errors.full_messages
    }
  end

  def new
    @exam = Exam.new
  end

  def create
    exam_params = params.require(:exam).permit(:name, :file, :enabled)
    file = exam_params[:file]
    upload = Upload.new(file)
    Audit.log("Uploaded file #{file.original_filename} for #{current_user.username} (#{current_user.id})")
    @exam = Exam.new(
      name: exam_params[:name],
      enabled: exam_params[:enabled],
      info: upload.info,
      files: upload.files
    )
    @exam.save!
    room = Room.create!(
      exam: @exam,
      name: 'Exam Room'
    )
    Registration.create!(
      exam: @exam,
      user: current_user,
      role: current_user.role.to_s,
      room: room
    )
    redirect_to @exam
  end

  private

  # returns true if lockout should occur
  def save_answers(answers, final = false)
    unless @registration.allow_submission?
      return true
    end

    @registration.update_attribute(:final, final)
    @registration.save_answers(answers)
    return false
  end

  # Returns all of the questions the current user has asked for this exam.
  def questions
    qs = @exam.questions_by(current_user).order(created_at: :desc)
    qs.map(&:serialize)
  end

  # Returns the announcements and messages for the current registration.
  def messages
    msgs = @exam.all_messages_for(current_user).order(id: :desc)
    msgs.map(&:serialize)
  end

  def messages_after(last_message_id)
    msgs = @exam
           .all_messages_for(current_user)
           .where('id > ?', last_message_id)
           .order(:created_at)
    msgs.map(&:serialize)
  end
end
