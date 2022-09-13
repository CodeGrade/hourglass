# frozen_string_literal: true

module Mutations
  # Mutation to delete an exam version (if possible)
  class DestroyExamVersion < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType

    field :deletedId, ID, null: false
    field :exam, Types::ExamType, null: false

    def authorized?(exam_version:)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:)
      check_final(exam_version)
      check_started(exam_version)

      exam = exam_version.exam
      destroyed = exam_version.destroy
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless destroyed

      { 
        deletedId: HourglassSchema.id_from_object(exam_version, Types::ExamVersionType, context) ,
        exam: exam
      }
    end

    private

    def check_final(ver)
      raise GraphQL::ExecutionError, 'Version has finished registrations.' if ver.registrations.final.any?
    end

    def check_started(ver)
      raise GraphQL::ExecutionError, 'Version has started registrations' if ver.registrations.started.any?
    end
  end
end
