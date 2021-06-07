module Mutations
  class ChangeMatchingDetails < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    argument :prompt, Types::HtmlInputType, required: false
    argument :update_prompt, Boolean, required: false, default_value: false

    argument :prompts_label, Types::HtmlInputType, required: false
    argument :update_prompts_label, Boolean, required: false, default_value: false
    
    argument :prompts, [Types::HtmlInputType], required: false
    argument :update_prompts, Boolean, required: false, default_value: false
    
    argument :match_values_label, Types::HtmlInputType, required: false
    argument :update_match_values_label, Boolean, required: false, default_value: false
    
    argument :match_values, [Types::HtmlInputType], required: false
    argument :update_match_values, Boolean, required: false, default_value: false
    
    argument :answer, [Integer], required: false
    argument :update_answer, Boolean, required: false, default_value: false

    field :body_item, Types::BodyItemType, null: false

    def authorized?(body_item:, **_args)
      return true if body_item.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(body_item:, **kwargs)
      if kwargs[:update_prompt]
        raise GraphQL::ExecutionError, 'Updated prompt must not be nil' unless kwargs[:prompt]
        body_item.info['prompt'] = kwargs[:prompt]
      end
      body_item.info['promptsLabel'] = kwargs[:prompts_label] if kwargs[:update_prompts_label]
      if kwargs[:update_prompts]
        raise GraphQL::ExecutionError, 'Updated prompts must not be nil' unless kwargs[:prompts]
        body_item.info['prompts'] = kwargs[:prompts]
      end
      body_item.info['valuesLabel'] = kwargs[:match_values_label] if kwargs[:update_match_values_label]
      if kwargs[:update_match_values]
        raise GraphQL::ExecutionError, 'Updated values must not be nil' unless kwargs[:match_values]
        body_item.info['values'] = kwargs[:match_values]
      end
      if kwargs[:update_answer]
        raise GraphQL::ExecutionError, 'Updated answer must not be nil' unless kwargs[:answer]
        body_item.answer = kwargs[:answer].map {|a| a == -1 ? nil : a}
      end
      puts "Answer is #{body_item.answer}"
      unless body_item.answer.all? { |a| a.nil? || (a >= -1 && a < body_item.info['values'].count) }
        raise GraphQL::ExecutionError, "Answers must be between -1 and number of values" 
      end

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end
  end
end
