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
          room: @exam.room_announcements.map { |m| serialize_room_announcement m }
        }
      end

      private

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
          sender: { displayName: msg.sender.display_name },
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
    end
  end
end
