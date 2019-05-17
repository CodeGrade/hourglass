class ExamController < ApplicationController
  def start
    @exam = Exam.find(params[:id])
  end
end
