module Mutations
  class CreateMultipleChoice < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :options, [Types::HtmlInputType], required: true
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, Integer, required: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, options:, answer: nil, prompt: nil)
      index = part.body_items.count
      answer = answer.to_i
      if options.size <= answer
        options += (answer + 1 - options.size).times.map {|_| { type: 'HTML', value: '' }}
      end
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'MultipleChoice',
          options: options,
          prompt: prompt || {
            type: 'HTML',
            value: '',
          }
        },
        answer: answer,
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
