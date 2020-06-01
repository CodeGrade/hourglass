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
          rooms: @exam.rooms.map do |room|
            regs = room_regs[room] || []
            serialize_room_regs room, regs
          end,
          sections: @exam.course.sections.map do |section|
            {
              id: section.id,
              title: section.title,
              students: section.students.map do |student|
                serialize_student student
              end
            }
          end
        }
      end

      def update_all
        # TODO
        created = true
        pp params[:registrations]
        render json: {
          created: created
        }
      end

      private

      def serialize_student(user)
        {
          id: user.id,
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
