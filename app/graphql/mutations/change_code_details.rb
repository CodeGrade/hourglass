module Mutations
  class ChangeCodeDetails < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    argument :lang, String, required: false
    argument :update_lang, Boolean, required: false, default_value: false
    
    argument :prompt, Types::HtmlInputType, required: false
    argument :update_prompt, Boolean, required: false, default_value: false
    
    argument :answer, Types::CodeAnswerInputType, required: false
    argument :update_answer, Boolean, required: false, default_value: false

    argument :initial_file, Types::CodeInitialFileType, required: false
    argument :initial_code, Types::CodeAnswerInputType, required: false
    argument :update_initial, Boolean, required: false, default_value: false


    field :body_item, Types::BodyItemType, null: false

    def authorized?(body_item:, **_args)
      return true if body_item.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(body_item:, **kwargs)
      if kwargs[:update_lang]
        raise GraphQL::ExecutionError, 'Updated lang must not be nil' unless kwargs[:lang]
        body_item.info['lang'] = kwargs[:lang] 
      end
      if kwargs[:update_prompt]
        raise GraphQL::ExecutionError, 'Updated prompt must not be nil' unless kwargs[:prompt]
        body_item.info['prompt'] = kwargs[:prompt]
      end
      if kwargs[:update_initial]
        if kwargs[:initial_file].present? && kwargs[:initial_code].present?
          raise GraphQL::ExecutionError, 'Updated initial file or code cannot both be present'
        elsif kwargs[:initial_file].nil? && kwargs[:initial_code].nil?
          body_item.info['initial'] = nil
        elsif kwargs[:initial_file].present?
          body_item.info['initial'] = kwargs[:initial_file]
        else
          body_item.info['initial'] = kwargs[:initial_code]
        end
      end
      body_item.answer = kwargs[:answer] if kwargs[:update_answer]

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end
  end
end
