module Mutations
  class CreateAllThatApply < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :options, [Types::HtmlInputType], required: true
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, [Boolean], required: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, options:, answer: nil, prompt: nil)
      if answer && options && answer.count != options.count
        raise GraphQL::ExecutionError, 'Must have same number of options as answers'
      end
      index = part.body_items.count
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'AllThatApply',
          options: options || [],
          prompt: {
            type: 'HTML',
            value: prompt || '',
          }
        },
        answer: answer || [],
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
