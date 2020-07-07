module Mutations
  class UpdateAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType
    argument :new_start_time, GraphQL::Types::ISO8601DateTime, required: false
    argument :percent_time_expansion, Integer, required: true

    field :accommodation, Types::AccommodationType, null: true

    def authorized?(accommodation:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: accommodation.exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(accommodation:, **args)
      updated = accommodation.update(args)
      raise GraphQL::ExecutionError, accommodation.errors.full_messages unless updated

      { accommodation: accommodation }
    end
  end
end
