# frozen_string_literal: true

module Api
  module Proctor
    # Exam-wide anomaly controls.
    class AnomaliesController < ProctorController
      before_action :find_exam_and_course, only: [:index]
      before_action :find_anomaly, only: [:destroy]

      before_action :require_proctor_reg

      def index
        anomalies = @exam.anomalies.map do |a|
          {
            id: a.id,
            user: {
              displayName: a.user.display_name,
              id: a.user.id,
            },
            reg: {
              id: a.registration.id,
              final: a.registration.final?,
            },
            time: a.created_at,
            reason: a.reason,
          }
        end

        render json: {
          anomalies: anomalies,
        }
      end

      def destroy
        @anomaly.destroy!
        render json: {
          success: true,
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message,
        }
      end
    end
  end
end
