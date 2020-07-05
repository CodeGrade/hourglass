module Mutations
  class FinalizeItem < BaseMutation
    argument :id, ID, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    # def authorized?(id:, **args)
    #   reg = ProctorRegistration.find_by(
    #     user: context[:current_user],
    #     exam: registration.exam,
    #   )
    #   return true if reg
    #   prof_reg = ProfessorCourseRegistration.find_by(
    #     user: context[:current_user],
    #     course: registration.exam.course,
    #   )
    #   return true if prof_reg
    #   return false, { errors: ['You do not have permission.'] }
    # end

    def resolve(id:)
      obj = HourglassSchema.object_from_id(id, context)
      case obj
      when Exam
        obj.finalize!
        {
          exam: obj,
          errors: [],
        }
      when ExamVersion
        obj.finalize!
        {
          exam: obj.exam,
          errors: [],
        }
      when Room
        obj.finalize!
        {
          exam: obj.exam,
          errors: [],
        }
      when Registration
        obj.finalize!
        {
          exam: obj.exam,
          errors: [],
        }
      else
        {
          exam: nil,
          errors: ['Invalid finalization target.']
        }
      end
    end
  end
end
