module Mutations
  class ChangeYesNoDetails < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType

    argument :prompt, Types::HtmlInputType, required: false
    argument :update_prompt, Boolean, required: false, default_value: false

    argument :label_type, Mutations::YesNoLabel, required: false
    argument :update_label_type, Boolean, required: false, default_value: false
    
    argument :answer, Boolean, required: false
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
      if kwargs[:update_label_type]
        raise GraphQL::ExecutionError, 'Updated label type must not be nil' unless kwargs[:label_type]
        body_item.info['noLabel'] = kwargs[:label_type] == 'yn' ? 'No' : 'False'
        body_item.info['yesLabel'] = kwargs[:label_type] == 'yn' ? 'Yes' : 'True'
      end
      body_item.answer = kwargs[:answer] if kwargs[:update_answer]

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end
  end
end
