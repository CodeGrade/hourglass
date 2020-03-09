# frozen_string_literal: true

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

  def clear_anomalies
    @exam = Exam.find(params[:exam_id])
    @registration = Registration.find(params[:registration_id])
    @registration.anomalies.destroy_all
    redirect_back fallback_location: exam_path(@exam)
  end

  def finalize
    @registration = Registration.find(params[:registration_id])
    @registration.update_attribute(:final, true)
    @exam = Exam.find(params[:exam_id])
    redirect_back fallback_location: exam_path(@exam)
  end
end
