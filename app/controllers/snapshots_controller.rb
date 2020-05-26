class SnapshotsController < ApplicationController
  before_action :require_current_user_unique_session
  before_action :find_course
  before_action :find_exam
  before_action :find_registration

  def create
    permitted = params.permit(:lastMessageId, :exam_id, answers: {}, exam: {})
    last_message_id = permitted.require(:lastMessageId)
    answers = permitted.require(:answers).to_h
    saved = @registration.save_answers(answers)
    render json: {
      lockout: !saved,
      messages: messages_after(last_message_id)
    }
  end

  # def show
  #   @final = @registration.final?
  # end

  private

  def require_current_user_unique_session
    require_current_user
  rescue DoubleLoginException => e
    registration = Registration.find_by(
      user_id: e.user.id,
      exam_id: params[:exam_id]
    )
    if registration
      Anomaly.create(registration: registration, reason: e.message)
    end
    render json: { lockout: true, reason: e.message }
  end

  def messages_after(last_message_id)
    msgs = @exam
           .all_messages_for(current_user)
           .where('id > ?', last_message_id)
           .order(:created_at)
    msgs.map(&:serialize)
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
end
