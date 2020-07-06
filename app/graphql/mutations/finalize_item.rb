module Mutations
  class FinalizeItem < BaseMutation
    argument :id, ID, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    def authorized?(id:, **args)
      obj = HourglassSchema.object_from_id(id, context)
      exam =
        case obj
        when Exam
          obj
        when ExamVersion
          obj.exam
        when Room
          obj.exam
        when Registration
          obj.exam
        else
          return false, { errors: ['Invalid target.'] }
        end
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
          errors: ['Invalid finalization target.'],
        }
      end
    end
  end
end
