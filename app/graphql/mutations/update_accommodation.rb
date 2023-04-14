# frozen_string_literal: true

module Mutations
  # Mutation to update a student's exam accommodations
  class UpdateAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType
    argument :new_start_time, GraphQL::Types::ISO8601DateTime, required: false
    argument :percent_time_expansion, Integer, required: true
    argument :policy_exemptions, [Types::PolicyExemptionType], required: false

    field :accommodation, Types::AccommodationType, null: true

    def authorized?(accommodation:, **_args)
      return true if accommodation.exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(accommodation:, **args)
      args[:new_start_time] = nil unless args.key?(:new_start_time)
      args[:policy_exemptions] = args[:policy_exemptions].join(',') if args[:policy_exemptions]
      updated = accommodation.update(args)
      raise GraphQL::ExecutionError, accommodation.errors.full_messages unless updated

      { accommodation: accommodation }
    end
  end
end
