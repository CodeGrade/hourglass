# frozen_string_literal: true

module Mutations
  class DestroyRubric < BaseMutation
    argument :rubric_id, ID, required: true, loads: Types::RubricType

    field :parent_section, Types::RubricType, null: false

    def authorized?(rubric:)
      return true if rubric.exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(rubric:)
      Rubric.transaction do
        exam_version = rubric.exam_version
        throw_if_root_rubric(rubric)
        parent_section = rubric.parent_section
        order = rubric.order

        destroyed = rubric.destroy
        raise GraphQL::ExecutionError, rubric.errors.full_messages.to_sentence unless destroyed

        parent_section.subsections.where(order: order..).order(:order).each do |section|
          section.update(order: section.order - 1)
        end

        cache_authorization!(exam_version.exam, exam_version.exam.course)
        { parent_section: parent_section }
      end
    end

    def throw_if_root_rubric(rubric)
      is_root_rubric = rubric.parent_section.nil?
      msg = 'Cannot destroy root rubrics'
      raise GraphQL::ExecutionError, msg if is_root_rubric
    end
  end
end
