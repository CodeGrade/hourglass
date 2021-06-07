# frozen_string_literal: true

module Mutations
  # Mutation to create a blank rubric somewhere in an exam version
  class CreateRubric < BaseMutation
    argument :parent_section_id, ID, required: false, loads: Types::RubricType
    argument :type, Types::RubricVariantType, required: true
    argument :description, String, required: false
    argument :points, Float, required: false

    field :parent_section, Types::RubricType, null: false
    field :rubric, Types::RubricType, null: false

    def authorized?(parent_section:, **_args)
      return true if parent_section.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(type:, parent_section: nil, description: nil, points: nil)
      Rubric.transaction do
        exam_version = parent_section.exam_version
        raise GraphQL::ExecutionError, 'Cannot create root rubrics' if parent_section.nil?

        order = parent_section.subsections&.count || 0
        rubric = Rubric.new(
          type: type.capitalize,
          order: order,
          description: description,
          points: points,
          exam_version: exam_version,
          parent_section: parent_section,
          question_id: parent_section.question_id,
          part_id: parent_section.part_id,
          body_item_id: parent_section.body_item_id,
        )
        saved = rubric.save
        raise GraphQL::ExecutionError, rubric.errors.full_messages.to_sentence unless saved

        parent_section.ancestor_links.each do |link|
          next if link.ancestor_id == parent_section.id
          new_link = RubricTreePath.find_or_initialize_by(
            ancestor_id: link.ancestor_id,
            descendant: rubric
          )
          if new_link.new_record?
            new_link.path_length = link.path_length + 1
            saved = new_link.save
            raise GraphQL::ExecutionError, saved.errors.full_messages.to_sentence unless saved
          else
            puts "Already found link #{new_link.inspect}"
          end
        end

        exam_version = rubric.exam_version
        cache_authorization!(exam_version.exam, exam_version.exam.course)
        { parent_section: parent_section, rubric: rubric }
      end
    end
  end
end
