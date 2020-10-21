# frozen_string_literal: true

module Types
  # Type describing a student room-update query
  class StudentRoomUpdate < Types::BaseInputObject
    description 'Assign all given students to proctor the given room.'
    argument :room_id, ID, required: true, loads: Types::RoomType
    argument :student_ids, [ID], required: true
    def students
      HourglassSchema.objects_from_ids(student_ids, context)
    end
  end
end

module Mutations
  # MNutation to update a student seating assignment
  class UpdateStudentSeating < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned_student_ids, [ID], required: true
    argument :student_room_updates, [Types::StudentRoomUpdate], required: true

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, unassigned_student_ids:, student_room_updates:)
      Registration.transaction do
        remove_rooms(exam, lookup_ids(unassigned_student_ids))
        do_updates(exam, student_room_updates)
      end
      cache_authorization!(exam, exam.course)
      {
        exam: exam,
      }
    end

    private

    def remove_rooms(exam, students)
      registrations = exam.registrations.includes(:user).index_by(&:user_id)
      students.each do |user|
        student_reg = registrations[user.id]
        raise GraphQL::ExecutionError, "No registration found for #{user.display_name}" unless student_reg

        updated = student_reg.update(room_id: nil)
        raise GraphQL::ExecutionError, student_reg.errors.full_messages.to_sentence unless updated
      end
    end

    def do_updates(exam, updates)
      registrations = exam.registrations.includes(:user).index_by(&:user_id)
      updates.each do |update|
        update.students.each do |user|
          student_reg = registrations[user.id] || Registration.new(user: user)
          student_reg.room = update[:room]
          saved = student_reg.save
          raise GraphQL::ExecutionError, student_reg.errors.full_messages.to_sentence unless saved
        end
      end
    end
  end
end
