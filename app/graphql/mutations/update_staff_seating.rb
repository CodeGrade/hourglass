# frozen_string_literal: true

module Types
  # Type to describe a proctor registration query
  class ProctorRegistrationUpdate < Types::BaseInputObject
    description 'Assign all staff members to proctor the given room.'
    argument :room_id, ID, required: true, loads: Types::RoomType
    argument :proctor_ids, [ID], required: true
    def proctors
      HourglassSchema.objects_from_ids(proctor_ids, context)
    end
  end
end

module Mutations
  # Mutation to update a staff seating assignment
  class UpdateStaffSeating < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned_proctor_ids, [ID], required: true
    argument :proctors_without_room_ids, [ID], required: true
    argument :proctor_registration_updates, [Types::ProctorRegistrationUpdate], required: true

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, unassigned_proctor_ids:, proctors_without_room_ids:, proctor_registration_updates:)
      ProctorRegistration.transaction do
        delete_unassigned(exam, lookup_ids(unassigned_proctor_ids))
        remove_rooms(exam, lookup_ids(proctors_without_room_ids))
        do_updates(exam, proctor_registration_updates)
      end
      cache_authorization!(exam, exam.course)
      {
        exam: exam,
      }
    end

    private

    def delete_unassigned(exam, proctors)
      registrations = exam.proctor_registrations.includes(:user).index_by(&:user_id)
      proctors.each do |user|
        proctor_reg = registrations[user.id]
        next unless proctor_reg

        destroyed = proctor_reg.destroy
        raise GraphQL::ExecutionError, proctor_reg.errors.full_messages.to_sentence unless destroyed
      end
    end

    def remove_rooms(exam, proctors)
      registrations = exam.proctor_registrations.includes(:user).index_by(&:user_id)
      proctors.each do |user|
        proctor_reg = registrations[user.id]
        next unless proctor_reg

        proctor_reg.room_id = nil
        saved = proctor_reg.save
        raise GraphQL::ExecutionError, proctor_reg.errors.full_messages.to_sentence unless saved
      end
    end

    def do_updates(exam, updates)
      registrations = exam.proctor_registrations.includes(:user).index_by(&:user_id)
      updates.each do |update|
        update.proctors.each do |user|
          proctor_reg = registrations[user.id] || ProctorRegistration.new(user: user, exam: exam)
          proctor_reg.room = update[:room]
          saved = proctor_reg.save
          raise GraphQL::ExecutionError, proctor_reg.errors.full_messages.to_sentence unless saved
        end
      end
    end
  end
end
