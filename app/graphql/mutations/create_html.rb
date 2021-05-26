module Mutations
  class CreateHtml < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :value, Types::HtmlInputType, required: false
    
    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, value: nil, prompt: nil)
      index = part.body_items.count
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: value || {
          type: 'HTML',
          value: '',
        },
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end

  end
end
