module Mutations
  class ChangeMultipleChoiceDetails < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    argument :prompt, Types::HtmlInputType, required: false
    argument :update_prompt, Boolean, required: false, default_value: false

    argument :options, [Types::HtmlInputType], required: false
    argument :update_options, Boolean, required: false, default_value: false
    
    argument :answer, Integer, required: false
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
      if kwargs[:update_options]
        raise GraphQL::ExecutionError, 'Updated options must not be nil' unless kwargs[:options]
        if kwargs[:options].count > 0
          newAns = (kwargs[:update_answer] && kwargs[:answer]) || body_item.answer
          if newAns && (newAns < 0 || newAns >= kwargs[:options].count)
            msg = "Answer must be in range [0, #{kwargs[:options].count}), but got #{newAns}"
            raise GraphQL::ExecutionError, msg
          end
        end
        body_item.info['options'] = kwargs[:options]
      end
      if kwargs[:update_answer]
        raise GraphQL::ExecutionError, 'Updated answer must not be nil' unless kwargs[:answer]
        newOpts = (kwargs[:update_options] && kwargs[:options]) || body_item.info['options']
        if kwargs[:answer] < 0 || kwargs[:answer] >= newOpts.count
          msg = "Answer must be in range [0, #{newOpts.count}), but got #{newAns}"
          raise GraphQL::ExecutionError, msg
        end
        body_item.answer = kwargs[:answer] 
      end

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end
  end
end
