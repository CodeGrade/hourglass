# frozen_string_literal: true

module Api
  module Grader
    # Grading exam version controls.
    class VersionsController < GraderController
      before_action :find_version, only: [:show]
      before_action :find_exam_and_course
      before_action :require_staff_reg

      # before_action :require_version_not_finalized

      def show
        render json: @version.serialize
      end

      private

      def require_version_not_finalized
        head :conflict unless @version.finalized?
      end
    end
  end
end

