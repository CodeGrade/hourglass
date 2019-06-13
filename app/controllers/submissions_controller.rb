class SubmissionsController < ApplicationController
  def show
    @submission = Submission.find(params[:id])
  end

  def index
    @exam = Exam.find(params[:exam_id])
    @submissions = @exam.submissions
  end
end
