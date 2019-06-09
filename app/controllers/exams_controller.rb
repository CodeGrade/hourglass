class ExamsController < ApplicationController
  before_action :require_current_user

  def show
    @exam = Exam.find(params[:id])
    unless @exam.enabled?
      redirect_back fallback_location: exams_path, alert: 'This exam has not been enabled yet.'
    end
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map(&:exam)
    @exams.keep_if(&:enabled?)
    redirect_to @exams[0] if @exams.size == 1
  end

  def submit
    debugger
  end

  def save_snapshot
    answers = params.require(:answers).permit(question: {}).to_h
    @exam = Exam.find(params[:id])
    sub = Submission.new(user: current_user, exam: @exam, final: false, anomalous: false)
    sub.save_answers(answers)
    sub.save!
    render json: {ok: true}
  end
end
