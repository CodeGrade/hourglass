# frozen_string_literal: true

class AnomaliesController < ApplicationController
  before_action :require_current_user
  before_action :require_admin_or_prof, except: [:create]

  before_action :find_exam
  before_action :find_reg

  before_action :my_reg, only: [:create]

  def find_exam
    @exam = Exam.find(params[:exam_id])
  end

  def find_reg
    @registration = Registration.find(params[:registration_id])
  end

  def index
    @anomalies = @registration.anomalies
  end

  def show
    @anomaly = Anomaly.find_by(id: params[:id])
    if @anomaly.nil?
      redirect_to exam_registration_anomalies_path(@exam, @registration)
    end
  end

  def my_reg
    render json: { created: false } if @registration.user != current_user
  end

  def create
    @anomaly = Anomaly.new(params.require(:anomaly).permit(:reason))
    @anomaly.registration = @registration
    created = @anomaly.save
    render json: { created: created }
  end

  def destroy
    @anomaly = Anomaly.find(params[:id])
    @anomaly.destroy
    redirect_back fallback_location: exam_registration_anomalies_path(@exam, @registration)
  end
end
