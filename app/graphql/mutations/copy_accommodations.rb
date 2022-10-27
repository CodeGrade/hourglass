# frozen_string_literal: true

module Mutations
  # Mutation to copy one exam's accommodations to another
  class CopyAccommodations < BaseMutation
    argument :source_exam_id, ID, required: true, loads: Types::ExamType
    argument :dest_exam_id, ID, required: true, loads: Types::ExamType

    field :source_exam, Types::ExamType, null: false
    field :exam, Types::ExamType, null: false
    field :duplicate_count, Integer, null: false
    field :accommodations, [Types::AccommodationType], null: false

    def authorized?(source_exam:, dest_exam:)
      return true if dest_exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(source_exam:, dest_exam:)
      Accommodation.transaction do
        duplicateCount = 0
        dest_users = dest_exam.registrations.index_by(&:user_id)
        accommodations = source_exam.accommodations.includes(:registration).map do |a|
          if dest_users[a.registration.user_id]
            accommodation = Accommodation.find_or_initialize_by(
              registration: dest_users[a.registration.user_id]
            )
            if accommodation.new_record?
              accommodation.percent_time_expansion = a.percent_time_expansion
              saved = accommodation.save
              raise GraphQL::ExecutionError, accommodation.errors.full_messages.to_sentence unless saved
              accommodation
            else
              duplicateCount += 1
            end
          end
        end
        { 
          source_exam: source_exam, 
          exam: dest_exam, 
          accommodations: accommodations.compact,
          duplicate_count: duplicateCount
        }
      end
    rescue ActiveRecord::RecordInvalid => exception
      raise GraphQL::ExecutionError, exception.message
    end
  end
end
