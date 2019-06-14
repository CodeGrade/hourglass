class RegistrationsController < ApplicationController
  before_action :require_admin_or_prof

  def show
    @registration = Registration.find(params[:id])
  end

  def index
    @exam = Exam.find(params[:exam_id])
    @registrations = @exam.registrations
  end
end
