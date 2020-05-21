class MainController < ApplicationController
  def index
    unless current_user
      redirect_to new_user_session_path
      return
    end

    registrations = current_user.registrations
    exams =
      registrations
      .map do |r|
        e = r.exam
        return nil unless e.enabled?

        {
          name: e.name,
          id: e.id,
          role: r.role,
          courseId: e.course_id
        }
      end.compact
    @exams = exams.group_by { |e| e[:courseId] }
    @courses =
      @exams.keys.map do |course_id|
        bottlenose_token.get("/api/courses/#{course_id}").parsed
      rescue StandardError
        nil
      end.compact
    @role = current_user.role
  end
end
