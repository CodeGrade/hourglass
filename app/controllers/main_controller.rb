# frozen_string_literal: true

# Entry point for sign-in / React app.
class MainController < ApplicationController
  def index
    return redirect_to new_user_session_path unless current_user

    sync_bn_courses
    render component: 'workflows', prerender: false
  end

  private

  def sync_bn_courses
    terms = bottlenose_get('/api/courses')
    terms.each do |term|
      active_courses = term['courses']
      active_courses.each do |active_course|
        next unless active_course['prof']

        hg_course = Course.find_or_initialize_by(bottlenose_id: active_course['id'])
        hg_course.title = active_course['name']
        hg_course.last_sync = DateTime.now
        hg_course.active = true
        hg_course.save!
        reg = current_user.professor_course_registrations.find_or_initialize_by(course: hg_course)
        reg.save!
      end
    end
  end
end
