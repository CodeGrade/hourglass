# frozen_string_literal: true

# Base controller for API.
class ApiController < ApplicationController
  respond_to :json

  before_action :require_current_user

  def me
    render json: {
      user: {
        displayName: current_user.display_name
      }
    }
  end

  private

  def require_current_user
    return head :unauthorized if current_user.nil?
  end

  def find_exam
    @exam ||= Exam.find_by(id: params[:exam_id])
    return unless @exam.nil?

    head :forbidden
  end

  def require_student_reg
    @registration ||= Registration.find_by(
      user: current_user,
      room: @exam.rooms
    )
    return unless @registration.nil?

    head :forbidden
  end
end
