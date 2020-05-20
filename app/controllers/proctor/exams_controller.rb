class Proctor::ExamsController < ProctorController
  before_action -> { find_exam(params[:id]) }, only: [:show, :finalize]
  before_action :require_exam_enabled
  before_action :require_current_user_registration_proctor

  def show
  end

  def finalize
    @exam.finalize!
    redirect_back fallback_location: proctor_exam_path(@exam), notice: 'Exam finalized.'
  end
end
