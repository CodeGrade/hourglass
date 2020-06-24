# frozen_string_literal: true

module Api
  module Proctor
    # Exam-wide anomaly controls.
    class AnomaliesController < ProctorController
      before_action :find_exam_and_course, only: [:index]
      before_action :find_course
      before_action :require_proctor_reg

      def index
        anomalies = @exam.anomalies.map do |a|
          {
            id: a.id,
            reg: {
              id: a.registration.id,
              displayName: a.user.display_name
            },
            time: a.created_at,
            reason: a.reason
          }
        end

        render json: {
          anomalies: anomalies
        }
      end
    end
  end
end
