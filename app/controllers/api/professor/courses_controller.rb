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
            user = sync_user(student)
            reg = sec.student_registrations.find_or_initialize_by(user: user)
            reg.save!
          end
          sec_obj['staff'].each do |staff|
            user = sync_user(staff['user'])
            reg = sec.staff_registrations.find_or_initialize_by(user: user)
            reg.ta = staff['ta']
            reg.save!
          end
          # TODO profs
        end
        render json: { synced: true }
      rescue Bottlenose::UnauthorizedError => e
        render json: {
          synced: false,
          reason: e.message
        }
      rescue StandardError => e
        render json: {
          synced: false,
          reason: e.message
        }
      end

      private

      def sync_user(u)
        user = User.where(username: u['username']).first_or_initialize
        user.display_name = u['display_name']
        user.nuid = u['nuid']
        user.email = u['email']
        user.image_url = u['image_url']
        user.save!
        user
      end
    end
  end
end
