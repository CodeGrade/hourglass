class Proctor::RegistrationsController < ProctorController
  before_action :find_exam
  before_action :require_exam_enabled
  before_action :require_current_user_registration_proctor

  def show
    @registration = Registration.find(params[:id])
    @version = @exam.version_for(@registration)
    @answers = @registration.get_current_answers
  end

  def index
    @registrations = @exam.registrations
  end

  def clear_anomalies
    @registration = Registration.find(params[:registration_id])
    @registration.anomalies.destroy_all
    redirect_back fallback_location: proctor_exam_path(@exam), notice: 'Anomalies cleared.'
  end

  def finalize
    @registration = Registration.find(params[:registration_id])
    @registration.update(final: true)
    redirect_back fallback_location: proctor_exam_path(@exam)
  end
end
