class Proctor::AnomaliesController < ProctorController
  before_action :find_exam
  before_action :require_current_user_registration_proctor

  def index
    @anomalies = @exam.anomalies
  end

  def destroy
    @anomaly = Anomaly.find(params[:id])
    @anomaly.destroy
    redirect_back fallback_location: exam_registration_anomalies_path(@exam, @registration), notice: 'Anomaly removed.'
  end
end
