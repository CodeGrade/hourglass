class RegistrationsController < ApplicationController
  before_action :require_admin_or_prof

  def show
    @exam = Exam.find(params[:exam_id])
    @registration = Registration.find(params[:id])
    @answers = @registration.get_current_answers
    @readonly = true
  end

  def index
    @exam = Exam.find(params[:exam_id])
    @registrations = @exam.registrations
  end
end
