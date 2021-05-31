module Mutations
  class ChangeQuestionDetails < BaseMutation
    argument :question_id, ID, required: true, loads: Types::QuestionType

    argument :name, Types::HtmlInputType, required: false
    argument :update_name, Boolean, required: false, default_value: false

    argument :description, Types::HtmlInputType, required: false
    argument :update_description, Boolean, required: false, default_value: false
    
    argument :extra_credit, Boolean, required: false
    argument :update_extra_credit, Boolean, required: false, default_value: false

    argument :separate_subparts, Boolean, required: false
    argument :update_separate_subparts, Boolean, required: false, default_value: false

    argument :references, [Types::ReferenceInputType], required: false
    argument :update_references, Boolean, required: false, default_value: false

    field :question, Types::QuestionType, null: false

    def authorized?(question:, **_args)
      return true if question.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(question:, **kwargs)
      Question.transaction do
        question.name = kwargs[:name][:value] if kwargs[:update_name]
        question.description = kwargs[:description]['value'] if kwargs[:update_description]
        if kwargs[:update_extra_credit]
          raise GraphQL::ExecutionError, 'Updated extra_credit must not be nil' unless kwargs.key?(:extra_credit)
          question.extra_credit = kwargs[:extra_credit]
        end
        if kwargs[:update_separate_subparts]
          raise GraphQL::ExecutionError, 'Updated separate_subparts must not be nil' unless kwargs.key?(:separate_subparts)
          question.separate_subparts = kwargs[:separate_subparts]
        end
        if kwargs[:update_references]
          raise GraphQL::ExecutionError, 'Updated references must not be nil' unless kwargs[:references]
          question.references.destroy_all
          kwargs[:references].each_with_index do |r, index|
            question.references << Reference.new(
              exam_version: question.exam_version,
              question: question,
              part: nil,
              type: r[:type],
              path: r[:path],
              index: index,
            )
          end
        end

        saved = question.save
        raise GraphQL::ExecutionError, question.errors.full_messages.to_sentence unless saved
        
        { question: question }
      end
    end
  end
end
