# frozen_string_literal: true

module Mutations
  class DestroyBodyItem < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    field :part, Types::PartType, null: false

    def authorized?(body_item:)
      return true if body_item.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end
  
    def resolve(body_item:)
      BodyItem.transaction do
        part = body_item.part
        index = body_item.index
        destroyed = body_item.destroy
        raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless destroyed

        part.reload
        part.body_items.where(index: index..).order(:index).each do |b|
          b.update(index: b.index - 1)
        end

        { part: part }
      end
    end

  end
end
