module Mutations
  class UpdateExam < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    def authorized?(exam:, **args)
      reg = ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )
      if reg.nil?
        return false, { errors: ['You do not have permission.'] }
      end
      true
    end

    def resolve(exam:, name:, duration:, start_time:, end_time:)
      if exam.update(name: name, duration: duration, start_time: start_time, end_time: end_time)
        {
          exam: exam,
          errors: [],
        }
      else
        {
          exam: nil,
          errors: exam.errors.full_messages
        }
      end
    end
  end
end
