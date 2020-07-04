# frozen_string_literal: true

module Api
  module Proctor
    # Messaging controls.
    class MessagesController < ProctorController
      before_action :find_exam_and_course
      before_action :require_proctor_reg

      def create
        message_params = params.require(:message).permit(:body, recipient: [:type, :id])
        case message_params[:recipient][:type]
        when 'EXAM'
          msg = ExamAnnouncement.new(exam: @exam, body: message_params[:body])
          msg.save!
        when 'VERSION'
          ver = ExamVersion.find_by!(id: message_params[:recipient][:id])
          raise "Invalid version: #{body[:id]}" if ver.exam != @exam

          msg = VersionAnnouncement.new(exam_version: ver, body: message_params[:body])
          msg.save!
        when 'ROOM'
          room = Room.find_by!(id: message_params[:recipient][:id])
          raise "Invalid room: #{body[:id]}" if room.exam != @exam

          msg = RoomAnnouncement.new(room: room, body: message_params[:body])
          msg.save!
        when 'DIRECT'
          user = @exam.students.find_by!(id: message_params[:recipient][:id])
          msg = Message.new(exam: @exam, sender: current_user, recipient: user, body: message_params[:body])
          msg.save!
        else
          raise "Invalid message type: #{message_params[:recipient][:type]}"
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
