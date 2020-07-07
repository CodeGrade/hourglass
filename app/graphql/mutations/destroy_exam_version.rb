module Mutations
  class DestroyExamVersion < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType

    field :deletedId, ID, null: false

    def authorized?(exam_version:)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam_version.exam.course,
      )

      [false, { errors: ['You do not have permission.'] }]
    end

    def resolve(exam_version:)
      destroyed = exam_version.destroy
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless destroyed

      { deletedId: HourglassSchema.id_from_object(exam_version, Types::ExamVersionType, context) }
    end
  end
end
