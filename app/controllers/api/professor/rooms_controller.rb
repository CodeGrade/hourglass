# frozen_string_literal: true

module Api
  module Professor
    class RoomsController < ProfessorController
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        render json: {
          unassigned: @exam.registrations_without_rooms.includes(:user).map do |reg|
            serialize_student reg.user
          end,
          rooms: @exam.rooms.includes(registrations: [:user], proctor_registrations: [:user]).map do |room|
            serialize_room_regs room
          end,
          sections: @exam.course.sections.includes(:staff).map do |section|
            {
              id: section.id,
              title: section.title,
              students: section.registered_students_for(@exam).map do |student|
                serialize_student student
              end,
            }
          end,
        }
      end

      def staff_regs
        render json: {
          unassigned: @exam.unassigned_staff.map do |s|
            serialize_student s
          end,
          proctors: @exam.proctor_registrations_without_rooms.includes(:user).map do |reg|
            serialize_student reg.user
          end,
          rooms: @exam.rooms.includes(registrations: [:user], proctor_registrations: [:user]).map do |room|
            serialize_room_regs room
          end,
          sections: @exam.course.sections.includes(:staff).map do |section|
            {
              id: section.id,
              title: section.title,
              students: section.staff.map do |student|
                serialize_student student
              end,
            }
          end,
        }
      end

      def update_all_rooms
        body = params.permit(deletedRooms: [], newRooms: [], updatedRooms: [:id, :name])
        Room.transaction do
          body[:deletedRooms].each do |id|
            room = @exam.rooms.find_by!(id: id)
            raise "'#{room.name}' has users. Please remove them before deleting it." if room.has_users?

            room.destroy!
          end

          body[:updatedRooms].each do |r|
            room = @exam.rooms.find_by!(id: r['id'])
            room.update!(name: r['name'])
          end

          body[:newRooms].each do |name|
            room = Room.create(exam: @exam, name: name)
            room.save!
          end
        end
        render json: { created: true }
      rescue StandardError => e
        render json: { created: false, reason: e.message }
      end

      def update_all
        body = params.permit(unassigned: [], rooms: {})
        Registration.transaction do
          body[:unassigned].each do |id|
            student_reg = @exam.registrations.find_by!(user_id: id)
            student_reg.update!(room_id: nil)
          end
          body[:rooms].each do |room_id, student_ids|
            student_ids.each do |id|
              student_reg = @exam.registrations.find_or_initialize_by(user_id: id)
              student_reg.room_id = room_id
              student_reg.save!
            end
          end
        end
        render json: {
          created: true,
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message,
        }
      end

      def update_all_staff
        body = params.permit(unassigned: [], rooms: {}, proctors: [])
        ProctorRegistration.transaction do
          body[:unassigned].each do |id|
            proctor_reg = @exam.proctor_registrations.find_by(user_id: id)
            next unless proctor_reg

            proctor_reg.destroy!
          end
          body[:proctors].each do |id|
            proctor_reg = @exam.proctor_registrations.find_or_initialize_by(user_id: id)
            proctor_reg.room_id = nil
            proctor_reg.save!
          end
          body[:rooms].each do |room_id, staff_ids|
            staff_ids.each do |id|
              proctor_reg = @exam.proctor_registrations.find_or_initialize_by(user_id: id)
              proctor_reg.room_id = room_id
              proctor_reg.save!
            end
          end
        end
        render json: {
          created: true,
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message,
        }
      end

      private

      def serialize_student(user)
        {
          id: user.id,
          displayName: user.display_name,
          username: user.username,
        }
      end

      def serialize_room_regs(room)
        {
          id: room.id,
          name: room.name,
          students: room.registrations.includes(:user).map(&:user).map do |s|
            serialize_student s
          end,
          proctors: room.proctor_registrations.includes(:user).map(&:user).map do |s|
            serialize_student s
          end,
        }
      end
    end
  end
end