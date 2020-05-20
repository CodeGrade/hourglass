class MainController < ApplicationController
  def index
    unless current_user
      redirect_to new_user_session_path
      return
    end

    registrations = current_user.registrations
    @exams =
      registrations
      .map(&:exam)
      .keep_if(&:enabled?)
      .map { |e| e.slice(:name, :id, :course_id) }
      .group_by { |e| e[:course_id] }
    @courses =
      @exams.keys.map do |course_id|
        bottlenose_token.get("/api/courses/#{course_id}").parsed
      rescue StandardError
        nil
      end.compact
    @role = current_user.role
  end
end
