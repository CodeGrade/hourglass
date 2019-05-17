class ExamController < ApplicationController
  def show
    @exam = Exam.find(params[:id])
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
