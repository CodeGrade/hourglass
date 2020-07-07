module Mutations
  class CreateExamVersion < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      [false, { errors: ['You do not have permission.'] }]
    end

    def new_empty_version(exam)
      n = exam.exam_versions.length + 1
      ExamVersion.new(
        exam: exam,
        name: "#{exam.name} Version #{n}",
        files: [],
        info: { policies: [], answers: [], contents: { reference: [], questions: [] } },
      )
    end

    def resolve(exam:)
      version = new_empty_version(exam)
      saved = version.save
      raise GraphQL::ExecutionError, version.errors.full_messages.to_sentence unless saved

      { exam_version: version }
    end
  end
end
