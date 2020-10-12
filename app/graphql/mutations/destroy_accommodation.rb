# frozen_string_literal: true

module Mutations
  # Mutation to remove a student's exam accommodation
  class DestroyAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType

    field :deletedId, ID, null: false
    field :registration_edge, Types::RegistrationType.edge_type, null: false
    field :registration, Types::RegistrationType, null: false

    def authorized?(accommodation:)
      return true if accommodation.exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(accommodation:)
      reg = accommodation.registration
      range_add = GraphQL::Relay::RangeAdd.new(
        parent: accommodation.exam,
        collection: accommodation.exam.registrations,
        item: reg,
        context: context,
      )
      destroyed = accommodation.destroy
      raise GraphQL::ExecutionError, accommodation.errors.full_messages.to_sentence unless destroyed

      {
        deletedId: HourglassSchema.id_from_object(accommodation, Types::AccommodationType, context),
        registration_edge: range_add.edge,
        registration: reg,
        errors: [],
      }
    end
  end
end
