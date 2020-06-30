# frozen_string_literal: true

module Api
  module Professor
    # Grading locks controls for exams.
    class GradingLocksController < ProfessorController
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        render json: {
          gradingLocks: @exam.grading_locks.map do |lock|
            {
              id: lock.id,
            }
          end,
        }
      end

      def release_all
        GradingLock.transaction do
          GradingLock.where(registration: @exam.registrations).destroy_all
        end
      end
    end
  end
end
