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

  def find_exam_and_course
    @exam ||= Exam.find_by(id: params[:exam_id])
    @course ||= @exam.course
    return unless @exam.nil?

    head :forbidden
  end

  def find_course
    @course ||= Course.find_by(id: params[:course_id])
    return unless @course.nil?

    head :forbidden
  end

  def find_version
    @version ||= ExamVersion.find_by(id: params[:version_id])
    @exam = @version.exam
    return unless @version.nil?

    head :forbidden
  end

  def require_student_reg
    @registration ||= @exam.registrations.find_by(user: current_user)
    return unless @registration.nil?

    head :forbidden
  end

  def require_prof_reg
    @professor_course_registration ||= ProfessorCourseRegistration.find_by(
      user: current_user,
      course: @course
    )
    return unless @professor_course_registration.nil?

    head :forbidden
  end
end
