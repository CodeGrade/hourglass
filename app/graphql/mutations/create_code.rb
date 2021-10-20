module Mutations
  class CreateCode < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :lang, String, required: true
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, Types::CodeAnswerInputType, required: false
    argument :initial_file, String, required: false
    argument :initial_code, Types::CodeAnswerInputType, required: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, lang:, answer: nil, prompt: nil, initial_file: nil, initial_code: nil)
      index = part.body_items.count
      if initial_code.present? && initial_file.present?
        raise GraphQL::ExecutionError, "Cannot specify both initial file and starter code"
      end
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'Code',
          lang: lang,
          prompt: prompt || {
            type: 'HTML',
            value: '',
          },
          initial: initial_code || initial_file,
        },
        answer: answer || {
          text: '',
          marks: []
        }
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
