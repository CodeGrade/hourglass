module Mutations
  class ChangeHtmlDetails < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    argument :value, Types::HtmlInputType, required: true

    field :body_item, Types::BodyItemType, null: false
  
    def authorized?(body_item:, **_args)
      return true if body_item.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(body_item:, value:)
      body_item.info = value

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end
  end
end