class RoomsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam
  before_action :find_room
  before_action :require_prof_reg

  def finalize
    finalized = @room.finalize!
    render json: {
      finalized: finalized
    }
  end
end
