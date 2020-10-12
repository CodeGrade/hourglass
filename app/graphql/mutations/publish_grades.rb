# frozen_string_literal: true

module Mutations
  # Mutation to up date an exam's administrative details
  class PublishGrades < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :published, Boolean, required: true

    field :exam, Types::ExamType, null: false
    field :published, Boolean, null: false
    field :count, Integer, null: false

    def authorized?(exam:, **_args)
      return true if exam.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, published:)
      Registration.transaction do
        updated = exam.registrations.update_all(published: published)
        raise GraphQL::ExecutionError, exam.errors.full_messages.to_sentence unless updated
        
        cache_authorization!(exam, exam.course)
        { exam: exam, published: published, count: exam.registrations.count }
      end
    rescue ActiveRecord::RecordInvalid => exception
      raise GraphQL::ExecutionError, exception.message
    end
  end
end
