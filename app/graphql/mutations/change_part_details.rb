module Mutations
  class ChangePartDetails < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType

    argument :name, Types::HtmlInputType, required: false
    argument :update_name, Boolean, required: false, default_value: false

    argument :description, Types::HtmlInputType, required: false
    argument :update_description, Boolean, required: false, default_value: false
    
    argument :extra_credit, Boolean, required: false
    argument :update_extra_credit, Boolean, required: false, default_value: false

    argument :points, Float, required: false
    argument :update_points, Boolean, required: false, default_value: false

    argument :references, [Types::ReferenceInputType], required: false
    argument :update_references, Boolean, required: false, default_value: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, **kwargs)
      Part.transaction do
        part.name = kwargs[:name][:value] if kwargs[:update_name]
        part.description = kwargs.dig(:description, :value) if kwargs[:update_description]
        if kwargs[:update_extra_credit]
          raise GraphQL::ExecutionError, 'Updated extra_credit must not be nil' unless kwargs.key?(:extra_credit)
          part.extra_credit = kwargs[:extra_credit]
        end
        if kwargs[:update_points]
          raise GraphQL::ExecutionError, 'Updated points must not be nil' unless kwargs.key?(:points)
          part.points = kwargs[:points]
        end
        if kwargs[:update_references]
          raise GraphQL::ExecutionError, 'Updated references must not be nil' unless kwargs[:references]
          part.references.destroy_all
          kwargs[:references].each_with_index do |r, index|
            part.references << Reference.new(
              exam_version: part.exam_version,
              part: part,
              question: nil,
              type: r[:type],
              path: r[:path],
              index: index,
            )
          end
        end

        saved = part.save
        raise GraphQL::ExecutionError, part.errors.full_messages.to_sentence unless saved

        { part: part }
      end
    end

  end
end
