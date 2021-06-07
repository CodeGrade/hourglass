module Mutations
  class CreateMatching < BaseMutation
    argument :part_id, ID, required: true, loads: Types::PartType
    argument :prompts, [Types::HtmlInputType], required: true
    argument :prompts_label, Types::HtmlInputType, required: false
    argument :match_values, [Types::HtmlInputType], required: true
    argument :match_values_label, Types::HtmlInputType, required: false
    argument :prompt, Types::HtmlInputType, required: false
    argument :answer, [Integer], required: false

    field :part, Types::PartType, null: false

    def authorized?(part:, **_args)
      return true if part.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(part:, **kwargs)
      prompt = kwargs[:prompt]
      prompts = kwargs[:prompts]
      prompts_label = kwargs[:prompts_label]
      match_values = kwargs[:match_values]
      match_values_label = kwargs[:match_values_label]
      answer = kwargs[:answer]


      unless answer.nil? || answer.count == prompts.count
        raise GraphQL::ExecutionError, "Must have one answer per prompt" 
      end
      unless answer.nil? || answer.all? { |a| a.nil? || (a >= -1 && a < values.count) }
        raise GraphQL::ExecutionError, "Answers must be between 0 and number of values" 
      end
      index = part.body_items.count
      body_item = BodyItem.new(
        part: part,
        index: index, 
        info: {
          type: 'Matching',
          prompts: prompts,
          promptsLabel: prompts_label,
          values: match_values,
          valuesLabel: match_values_label,
          prompt: prompt || {
            type: 'HTML',
            value: '',
          }.compact
        },
        answer: (answer&.map {|i| i == -1 ? nil : i}) || Array.new(prompts.count, nil),
      )
      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { part: body_item.part }
    end
  end
end
