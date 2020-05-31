# frozen_string_literal: true

module Api
  module Professor
    class RoomsController < ProfessorController
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        room_regs = @exam.registrations.group_by(&:room)
        render json: {
          unassigned: @exam.unassigned_students.map do |s|
            serialize_student s
          end,
          rooms: room_regs.map do |room, regs|
            serialize_room_regs room, regs
          end
        }
      end

      def serialize_student(user)
        {
          displayName: user.display_name,
          username: user.username
        }
      end

      def serialize_room_regs(room, regs)
        {
          id: room.id,
          name: room.name,
          students: regs.map(&:user).map do |s|
            serialize_student s
          end
        }
      end
    end
  end
end
