module Mutations
  class UpdateExam < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: true

    def authorized?(exam:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, **args)
      updated = exam.update(args)
      raise GraphQL::ExecutionError, exam.errors.full_messages.to_sentence unless updated

      { exam: exam }
    end
  end
end
