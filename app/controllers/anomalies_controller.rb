class AnomaliesController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam
  before_action :find_room
  before_action :find_registration
  before_action :find_anomaly, only: [:destroy]

  before_action :require_exam_enabled
  before_action :require_current_user_registration_proctor

  def index
    @anomalies = @exam.anomalies
    render inline: 'anomalies#index'
  end

  def destroy
    @anomaly = Anomaly.find(params[:id])
    @anomaly.destroy
    redirect_back fallback_location: exam_path(@exam),
                  notice: 'Anomaly removed.'
  end

  def clear
    @registration.anomalies.destroy_all!
    redirect_back fallback_location: exam_path(@exam),
                  notice: 'Anomalies cleared.'
  end
end
