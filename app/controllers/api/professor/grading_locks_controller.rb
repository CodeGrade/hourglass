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
        initialize_grading_locks(true)
      end

      def start_grading
        @exam.finalize_registrations_that_have_run_out_of_time!
        initialize_grading_locks
      end

      private

      def initialize_grading_locks(reset = false)
        pairs_by_version = @exam.exam_versions.map { |v| [v.id, v.qp_pairs] }.to_h
        GradingLock.transaction do
          GradingLock.where(registration: @exam.registrations).destroy_all if reset
          @exam.finalized_registrations.each do |registration|
            pairs_by_version[registration.exam_version_id].each do |qnum, pnum|
              GradingLock.find_or_create_by(registration: registration, qnum: qnum, pnum: pnum)
            end
          end
        end
        render json: {}
      end
    end
  end
end
