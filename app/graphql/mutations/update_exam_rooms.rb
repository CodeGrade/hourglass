# frozen_string_literal: true

module Types
  class RoomUpdate < Types::BaseInputObject
    description 'Update a room name.'
    argument :room_id, ID, required: true, loads: Types::RoomType
    argument :name, String, required: true
  end
end

module Mutations
  class UpdateExamRooms < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :deleted_room_ids, [ID], required: true, loads: Types::RoomType
    argument :new_rooms, [String], required: true
    argument :updated_rooms, [Types::RoomUpdate], required: true

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, deleted_rooms:, new_rooms:, updated_rooms:)
      Room.transaction do
        delete_rooms(deleted_rooms)
        create_rooms(exam, new_rooms)
        update_rooms(updated_rooms)
      end
      {
        exam: exam,
      }
    end

    private

    def update_rooms(updates)
      updates.each do |update|
        update[:room].update!(name: update[:name])
      end
    end

    def create_rooms(exam, new_rooms)
      new_rooms.each do |name|
        Room.create!(exam: exam, name: name)
      end
    end

    def delete_rooms(deleted_rooms)
      deleted_rooms.each do |r|
        destroyed = r.destroy
        raise GraphQL::ExecutionError, r.errors.full_messages.to_sentence unless destroyed
      end
    end
  end
end
