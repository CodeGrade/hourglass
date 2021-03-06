# frozen_string_literal: true

module Mutations
  # Mutation to create a new exam
  class CreateExam < BaseMutation
    argument :course_id, ID, required: true, loads: Types::CourseType
    argument :name, String, required: true
    argument :duration, Integer, required: true
    argument :start_time, GraphQL::Types::ISO8601DateTime, required: true
    argument :end_time, GraphQL::Types::ISO8601DateTime, required: true

    field :exam, Types::ExamType, null: false

    def authorized?(course:, **_args)
      return true if course.user_is_professor?(context[:current_user])
      
      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(**args)
      exam = Exam.new(args)
      saved = exam.save
      raise GraphQL::ExecutionError, exam.errors.full_messages.to_sentence unless saved

      cache_authorization!(exam, exam.course)
      { exam: exam }
    end
  end
end
