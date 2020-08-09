# frozen_string_literal: true

module Mutations
  # Mutation to create a student's exam accommodation
  class CreateAccommodation < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType

    field :accommodation, Types::AccommodationType, null: false
    field :accommodationConnection, Types::AccommodationType.connection_type, null: false
    field :accommodationEdge, Types::AccommodationType.edge_type, null: false
    field :registration_id, ID, null: false

    def authorized?(registration:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: registration.exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(registration:)
      accommodation = Accommodation.new(registration: registration)
      saved = accommodation.save
      raise GraphQL::ExecutionError, accommodation.errors.full_messages.to_sentence unless saved

      exam = accommodation.exam
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: exam,
        collection: exam.accommodations,
        item: accommodation,
        context: context,
      )
      {
        accommodation: accommodation,
        accommodationConnection: range_add.connection,
        accommodationEdge: range_add.edge,
        registration_id: HourglassSchema.id_from_object(registration, Types::RegistrationType, context),
      }
    end
  end
end
