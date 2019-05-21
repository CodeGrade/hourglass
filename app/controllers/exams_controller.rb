class ExamsController < ApplicationController
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

  def start
    @exam = Exam.find(params[:id])
    render html: 'TODO'
  end

  def save_snapshot
    @exam = Exam.find(params[:id])
    render html: 'TODO'
  end
end
