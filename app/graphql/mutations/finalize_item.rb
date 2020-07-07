module Mutations
  class FinalizeItem < BaseMutation
    argument :id, ID, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    def authorized?(id:, **_args)
      obj = HourglassSchema.object_from_id(id, context)
      exam = exam_for_obj(obj)
      raise GraphQL::ExecutionError, 'Invalid target.' unless exam
      return true if ProctorRegistration.find_by(user: context[:current_user], exam: exam)
      return true if ProfessorCourseRegistration.find_by(user: context[:current_user], course: exam.course)

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(id:)
      obj = HourglassSchema.object_from_id(id, context)
      obj.finalize!
      exam = exam_for_obj(obj)
      return { exam: nil, errors: ['Invalid finalization target.'] } unless exam

      { exam: exam, errors: [] }
    end

    private

    def exam_for_obj(obj)
      case obj
      when Exam
        obj
      when ExamVersion, Room, Registration
        obj.exam
      end
    end
  end
end
