module Mutations
  class FinalizeRegistration < BaseMutation
    argument :registration_id, ID, required: true, loads: Types::RegistrationType

    field :registration, Types::RegistrationType, null: false

    def authorized?(registration:, **args)
      reg = ProctorRegistration.find_by(
        user: context[:current_user],
        exam: registration.exam,
      )
      return true if reg
      prof_reg = ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: registration.exam.course,
      )
      return true if prof_reg
      return false, { errors: ['You do not have permission.'] }
    end

    def resolve(registration:)
      registration.finalize!
      {
        registration: registration,
        errors: [],
      }
    end
  end
end
