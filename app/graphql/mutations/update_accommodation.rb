module Mutations
  class UpdateAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType
    argument :new_start_time, GraphQL::Types::ISO8601DateTime, required: false
    argument :percent_time_expansion, Integer, required: true

    field :accommodation, Types::AccommodationType, null: true
    field :errors, [String], null: false

    def authorized?(accommodation:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: accommodation.exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(accommodation:, **args)
      updated = accommodation.update(args)
      if updated
        { accommodation: accommodation, errors: [] }
      else
        { accommodation: nil, errors: accommodation.errors.full_messages }
      end
    end
  end
end
