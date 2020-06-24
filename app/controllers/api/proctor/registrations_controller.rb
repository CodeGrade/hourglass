# frozen_string_literal: true

module Api
  module Proctor
    # Student registration controls.
    class RegistrationsController < ProctorController
      before_action :find_registration_and_exam_and_course
      before_action :require_proctor_reg

      def finalize
        raise 'That registration is already final.' if @registration.final?

        @registration.finalize!
        render json: {
          success: true
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message
        }
      end
    end
  end
end
