class Student::ExamsController < StudentController
  before_action -> { find_exam(params[:id]) }, only: [:show]
  before_action :find_exam, except: [:show]

  before_action :require_exam_enabled
  before_action :require_current_user_registration

  before_action :check_anomaly, only: [:start, :submit, :ask_question]
  before_action :check_final, only: [:start, :submit, :ask_question]

  prepend_before_action :catch_require_current_user, only: [:save_snapshot]

  def start
    unless @registration.visible_to? current_user
      render json: { message: "There is no submission for that user." }
      return
    end
    answers = @registration.get_current_answers
    version = @exam.version_for(@registration)
    render(
      json: {
        type: 'CONTENTS',
        exam: {
          questions: version['contents']['questions'],
          reference: version['contents']['reference'],
          instructions: version['contents']['instructions'],
          files: @exam.files
        },
        answers: answers,
        messages: messages,
        questions: questions
      }
    )
  end

  def submit
    permitted = params.permit(:id, exam: {}, answers: {})
    answers = permitted[:answers].to_h
    lockout = save_answers(answers, true)
    render json: { lockout: lockout }
  end

  def save_snapshot
    permitted = params.permit(:lastMessageId, :exam_id, answers: {}, exam: {})
    last_message_id = permitted.require(:lastMessageId)
    answers = permitted.require(:answers).to_h
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

  def show
    @final = @registration.final?
  end

  private

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
