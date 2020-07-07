module Mutations
  class CreateExamVersion < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:)
      version = ExamVersion.new_empty(exam)
      saved = version.save
      raise GraphQL::ExecutionError, version.errors.full_messages.to_sentence unless saved

      { exam_version: version }
    end
  end
end
