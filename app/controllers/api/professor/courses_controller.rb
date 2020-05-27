# frozen_string_literal: true

module Api
  module Professor
    class CoursesController < ProfessorController
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
    end
  end
end
