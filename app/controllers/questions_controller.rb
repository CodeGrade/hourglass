class QuestionsController < ApplicationController
  before_action :require_current_user
  before_action :find_course
  before_action :find_exam
  before_action :find_room
  before_action :find_registration

  before_action :check_anomaly
  before_action :check_final

  def create
    q_params = params.require(:question).permit(:body)
    q = Question.new(q_params)
    q.sender = current_user
    render json: {
      success: q.save,
      messages: q.errors.full_messages
    }
  end
end
