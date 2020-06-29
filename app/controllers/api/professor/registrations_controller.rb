# frozen_string_literal: true

module Api
  module Professor
    # Registration controls for exams.
    class RegistrationsController < ProfessorController
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        render json: {
          registrations: @exam.registrations.includes(:user).map do |r|
            {
              id: r.id,
              displayName: r.user.display_name,
            }
          end,
        }
      end
    end
  end
end
