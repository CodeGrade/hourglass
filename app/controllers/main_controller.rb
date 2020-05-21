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
        next unless e.enabled?

        {
          name: e.name,
          id: e.id,
          role: r.role,
          courseId: e.course_id
        }
      end.compact
    @exams = exams.group_by { |e| e[:courseId] }
    @courses =
      @exams.map do |course_id, course_exams|
        bottlenose_token.get('/api/courses', course_id: course_id).parsed.merge(
          {
            createExams: current_user_professor_for_course(course_id)
          }
        )
      rescue StandardError
        if Rails.env.development?
          {
            id: course_id,
            name: "DEV COURSE (id: #{course_id})",
            createExams: course_exams.first[:role] == 'professor'
          }
        end
      end.compact
  end
end
