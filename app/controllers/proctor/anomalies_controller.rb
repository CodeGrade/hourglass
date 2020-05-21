class Proctor::AnomaliesController < ProctorController
  before_action :find_exam
  before_action :require_current_user_registration_proctor

  def index
    @anomalies = @exam.anomalies
  end

  def destroy
    @anomaly = Anomaly.find(params[:id])
    @anomaly.destroy
    redirect_back fallback_location: proctor_exam_anomalies_path(@exam), notice: 'Anomaly removed.'
  end
end
