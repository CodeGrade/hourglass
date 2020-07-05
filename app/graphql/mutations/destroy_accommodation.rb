module Mutations
  class DestroyAccommodation < BaseMutation
    argument :accommodation_id, ID, required: true, loads: Types::AccommodationType

    field :deletedId, ID, null: false
    field :errors, [String], null: false

    def authorized?(accommodation:)
      exam = accommodation.exam
      return true if ProctorRegistration.find_by(
        user: context[:current_user],
        exam: exam,
      )

      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
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
