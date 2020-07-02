module Mutations
  class UpdateExam < BaseMutation

    argument :rails_id, Integer, required: true
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: true
    field :errors, [String], null: false

    def resolve(rails_id:, name:, duration:, start_time:, end_time:)
      exam = Exam.find(rails_id)
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
