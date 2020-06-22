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

      def staff_regs
        room_regs = @exam.proctor_registrations.group_by(&:room)
        render json: {
          unassigned: @exam.unassigned_staff.map do |s|
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
              students: section.staff.map do |student|
                serialize_student student
              end
            }
          end
        }
      end

      def update_all
        body = params.permit(unassigned: [], rooms: {})
        body[:unassigned].each do |id|
          # TODO: remove registration
          pp "UNASSIGNED: #{id}"
        end
        body[:rooms].each do |room_id, student_ids|
          student_ids.each do |id|
            student_reg = @exam.registrations.find_or_initialize_by(user_id: id)
            student_reg.room_id = room_id
            student_reg.exam_version ||= @exam.exam_versions.first
            student_reg.save!
          end
        end
        render json: {
          created: true
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message
        }
      end

      def update_all_staff
        body = params.permit(unassigned: [], rooms: {})
        body[:unassigned].each do |id|
          # TODO: remove registration
          pp "UNASSIGNED: #{id}"
        end
        body[:rooms].each do |room_id, staff_ids|
          staff_ids.each do |id|
            proctor_reg = @exam.proctor_registrations.find_or_initialize_by(user_id: id)
            proctor_reg.room_id = room_id
            proctor_reg.save!
          end
        end
        render json: {
          created: true
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message
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
