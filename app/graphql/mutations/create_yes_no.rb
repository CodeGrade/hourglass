module Mutations
  class YesNoLabel < Types::BaseEnum
    value 'yn'
    value 'tf'
  end

  class CreateYesNo < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, Boolean, required: false
    argument :label_type, YesNoLabel, required: true

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, label_type:, answer: nil, prompt: nil)
      index = part.body_items.count
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'YesNo',
          prompt: prompt || {
            type: 'HTML',
            value: '',
          },
          noLabel: label_type == 'yn' ? 'No' : 'False',
          yesLabel: label_type == 'yn' ? 'Yes' : 'True',
        },
        answer: answer,
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
