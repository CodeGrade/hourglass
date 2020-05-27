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
    end
  end
end
