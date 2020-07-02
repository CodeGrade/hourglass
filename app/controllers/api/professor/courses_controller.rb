# frozen_string_literal: true

module Api
  module Professor
    class CoursesController < ProfessorController
      before_action :find_course
      before_action :require_prof_reg

      def sync
        bottlenose_api.sync_course_regs(@course)
        render json: { synced: true }
      rescue Bottlenose::UnauthorizedError => e
        render json: {
          synced: false,
          reason: e.message,
        }
      rescue StandardError => e
        render json: {
          synced: false,
          reason: e.message,
        }
      end
    end
  end
end
