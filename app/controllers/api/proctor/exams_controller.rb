# frozen_string_literal: true

module Api
  module Proctor
    # Exam proctoring controls.
    class ExamsController < ProctorController
      before_action :find_exam_and_course
      before_action :require_proctor_reg

      def finalize
        target = params.require(:target).permit(:type, :id)
        case target[:type]
        when 'EXAM'
          raise 'TODO'
        when 'VERSION'
          raise 'TODO'
        when 'ROOM'
          raise 'TODO'
        when 'USER'
          raise 'TODO'
        else
          raise "Invalid recipient type: #{target[:type]}"
        end
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
