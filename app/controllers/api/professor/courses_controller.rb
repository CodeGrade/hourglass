# frozen_string_literal: true

module Api
  module Professor
    class CoursesController < ProfessorController
      before_action :find_course, except: [:index]
      before_action :require_prof_reg, except: [:index]

      def index
        @registrations = ProfessorCourseRegistration.where(user: current_user)
        render json: {
          courses: @registrations.map(&:course).map do |course|
            {
              id: course.id,
              title: course.title
            }
          end
        }
      end

      def show
        render json: {
          course: @course.slice(:id, :title)
        }
      end

      def sync
        got = bottlenose_get("/api/courses/#{@course.bottlenose_id}/registrations")
        got.each do |sec_id, sec_obj|
          sec = @course.sections.find_or_initialize_by(bottlenose_id: sec_id)
          sec.title = "#{sec_obj['type']} - #{sec_obj['meeting_time']}"
          sec.save!
          sec_obj['students'].each do |student|
            user = User.where(username: student['username']).first_or_initialize
            user.display_name = student['display_name']
            user.nuid = student['nuid']
            user.email = student['email']
            user.image_url = student['image_url']
            user.save!
            reg = sec.student_registrations.find_or_initialize_by(user: user)
            reg.save!
          end
        end
        render json: { synced: true }
      rescue Bottlenose::UnauthorizedError => e
        render json: {
          synced: false,
          reason: e.message
        }
      rescue StandardError
        render json: {
          synced: false,
          reason: 'Unknown error occurred.'
        }
      end
    end
  end
end
