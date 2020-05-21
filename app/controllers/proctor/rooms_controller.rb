class Proctor::RoomsController < ProctorController
  before_action :find_exam
  before_action :require_current_user_registration_proctor

  def show
    @room = @exam.rooms.find(params[:id])
  end

  def index
    @rooms = @exam.rooms
  end

  def finalize
    @room = @exam.rooms.find(params[:room_id])
    @room.finalize!
    redirect_back fallback_location: proctor_exam_room_path(@exam, @room), notice: 'Room finalized.'
  end
end
