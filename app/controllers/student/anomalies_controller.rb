class Student::AnomaliesController < StudentController
  before_action :find_exam
  before_action :require_exam_enabled
  before_action :require_current_user_registration

  def create
    if @registration.user != current_user
      render json: { created: false }
      return
    end
    @anomaly = Anomaly.new(params.require(:anomaly).permit(:reason))
    @anomaly.registration = @registration
    created = @anomaly.save
    render json: { created: created }
  end
end

