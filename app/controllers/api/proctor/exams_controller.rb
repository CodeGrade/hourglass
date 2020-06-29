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
          raise 'That exam is already final.' if @exam.finalized?

          @exam.finalize!
        when 'VERSION'
          ver = @exam.exam_versions.find_by!(id: target[:id])
          raise 'That version is already final.' if ver.finalized?

          ver.finalize!
        when 'ROOM'
          room = @exam.rooms.find_by!(id: target[:id])
          raise 'That room is already final.' if room.finalized?

          room.finalize!
        when 'USER'
          reg = @exam.registrations.find_by!(user_id: target[:id])
          raise 'That registration is already final.' if reg.final?

          reg.finalize!
        else
          raise "Invalid recipient type: #{target[:type]}"
        end
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
