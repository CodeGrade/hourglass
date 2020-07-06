class Types::StudentRoomUpdate < Types::BaseInputObject
  description 'Assign all given students to proctor the given room.'
  argument :room_id, ID, required: true, loads: Types::RoomType
  argument :student_ids, [ID], required: true, loads: Types::UserType
end

module Mutations
  class UpdateStudentSeating < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned_student_ids, [ID], required: true, loads: Types::UserType
    argument :student_room_updates, [Types::StudentRoomUpdate], required: true

    field :exam, Types::ExamType, null: false

    def resolve(exam:, unassigned_students:, student_room_updates:)
      Registration.transaction do
        remove_rooms(exam, unassigned_students)
        do_updates(exam, student_room_updates)
      end
      {
        exam: exam,
      }
    end

    private

    def remove_rooms(exam, students)
      students.each do |user|
        student_reg = exam.registrations.find_by!(user: user)
        updated = student_reg.update(room_id: nil)
        raise GraphQL::ExecutionError, student_reg.errors.full_messages.to_sentence unless updated
      end
    end

    def do_updates(exam, updates)
      updates.each do |update|
        update[:students].each do |user|
          student_reg = exam.registrations.find_or_initialize_by(user: user)
          student_reg.room = update[:room]
          saved = student_reg.save
          raise GraphQL::ExecutionError, student_reg.errors.full_messages.to_sentence unless saved
        end
      end
    end
  end
end
