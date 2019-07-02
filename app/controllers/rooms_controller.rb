class RoomsController < ApplicationController
  before_action :require_current_user
  before_action :require_admin_or_prof

  def show
    @room = Room.find(params[:id])
    @exam = @room.exam
  end

  def index
    @exam = Exam.find(params[:exam_id])
    @rooms = @exam.rooms
  end

  def finalize
    @room = Room.find(params[:room_id])
    @exam = @room.exam
    @room.registrations.update_all(final: true)
    redirect_back fallback_location: exam_room_path(@exam, @room)
  end
end
