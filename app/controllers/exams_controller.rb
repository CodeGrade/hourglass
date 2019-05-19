class ExamsController < ApplicationController
  def show
    @exam = Exam.find(params[:id])
  end

  def index
    registrations = Registration.where(user: current_user)
    @exams = registrations.map &:exam
  end

  def start
    @exam = Exam.find(params[:id])
    render html: "TODO"
  end

  def save_snapshot
    @exam = Exam.find(params[:id])
    render html: "TODO"
  end
end
