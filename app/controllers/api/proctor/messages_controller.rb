# frozen_string_literal: true

module Api
  module Proctor
    # Messaging controls.
    class MessagesController < ProctorController
      before_action :find_exam_and_course
      before_action :require_proctor_reg

      def index
        render json: {
          sent: @exam.messages.map { |m| serialize_message m },
          questions: @exam.questions.map { |q| serialize_question q },
          version: @exam.version_announcements.map { |m| serialize_ver_announcement m },
          room: @exam.room_announcements.map { |m| serialize_room_announcement m },
          exam: @exam.exam_announcements.map { |m| serialize_exam_announcement m },
          recipients: recipient_list
        }
      end

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
          success: true
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message
        }
      end

      private

      def recipient_list
        {
          students: direct_recipients,
          versions: version_recipients,
          rooms: room_recipients
        }
      end

      def direct_recipients
        @exam.students.order(:display_name).map do |s|
          {
            id: s.id,
            name: s.display_name
          }
        end
      end

      def version_recipients
        @exam.exam_versions.order(:name).map do |ev|
          {
            id: ev.id,
            name: ev.name
          }
        end
      end

      def room_recipients
        @exam.rooms.order(:name).map do |room|
          {
            id: room.id,
            name: room.name
          }
        end
      end

      def serialize_message(msg)
        {
          id: msg.id,
          body: msg.body,
          time: msg.created_at,
          sender: { isMe: msg.sender == current_user, displayName: msg.sender.display_name },
          recipient: { displayName: msg.recipient.display_name }
        }
      end

      def serialize_question(msg)
        {
          id: msg.id,
          time: msg.created_at,
          sender: { id: msg.sender.id, displayName: msg.sender.display_name },
          body: msg.body
        }
      end

      def serialize_ver_announcement(msg)
        {
          id: msg.id,
          time: msg.created_at,
          version: msg.exam_version.slice(:name),
          body: msg.body
        }
      end

      def serialize_room_announcement(msg)
        {
          id: msg.id,
          time: msg.created_at,
          room: msg.room.slice(:name),
          body: msg.body
        }
      end

      def serialize_exam_announcement(msg)
        {
          id: msg.id,
          time: msg.created_at,
          body: msg.body
        }
      end
    end
  end
end
