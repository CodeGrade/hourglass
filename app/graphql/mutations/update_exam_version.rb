module Mutations
  class UpdateExamVersion < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType
    argument :name, String, required: true
    argument :info, String, required: true
    argument :files, String, required: true

    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam_version:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam_version.exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:, **update)
      # TEMPORARY, until we can propagate rubrics correctly
      info = JSON.parse(update[:info])
      rubrics = info['rubrics'] || exam_version.info['rubrics']
      info['rubrics'] = rubrics
      update[:info] = info.to_json
      updated = exam_version.update(update)
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless updated

      { exam_version: exam_version }
    end
  end
end
