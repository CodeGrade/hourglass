module Mutations
  class CreateExam < BaseMutation
    argument :course_id, ID, required: true, loads: Types::CourseType
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    def authorized?(course:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      exam = Exam.new(args)
      if exam.save
        {
          exam: exam,
          errors: [],
        }
      else
        {
          exam: nil,
          errors: exam.errors.full_messages,
        }
      end
    end
  end
end
