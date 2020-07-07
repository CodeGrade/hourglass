module Mutations
  class DestroyAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType

    field :deletedId, ID, null: false
    field :errors, [String], null: false

    def authorized?(accommodation:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: accommodation.exam.course,
      )

      [false, { errors: ['You do not have permission.'] }]
    end

    def resolve(accommodation:)
      accommodation.destroy!
      {
        deletedId: HourglassSchema.id_from_object(accommodation, Types::AccommodationType, context),
        errors: [],
      }
    end
  end
end
