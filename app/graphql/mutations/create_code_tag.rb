module Mutations
  class CreateCodeTag < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :choices, Types::CodeTagChoiceType, required: true
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, Types::CodeTagInputType, required: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, choices:, answer: nil, prompt: nil)
      index = part.body_items.count
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'CodeTag',
          choices: choices,
          prompt: prompt || {
            type: 'HTML',
            value: '',
          }
        },
        answer: answer || {
          lineNumber: 0,
        }
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
