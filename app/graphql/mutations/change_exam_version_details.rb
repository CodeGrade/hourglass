module Mutations
  class ChangeExamVersionDetails < BaseMutation
    argument :exam_version_id, ID, required: true, loads: Types::ExamVersionType

    argument :name, String, required: false
    argument :update_name, Boolean, required: false, default_value: false

    argument :instructions, Types::HtmlInputType, required: false
    argument :update_instructions, Boolean, required: false, default_value: false

    argument :policies, [Types::LockdownPolicyType], required: false
    argument :update_policies, Boolean, required: false, default_value: false

    argument :files, GraphQL::Types::JSON, required: false
    argument :update_files, Boolean, required: false, default_value: false
    
    field :exam_version, Types::ExamVersionType, null: false

    def authorized?(exam_version:, **_args)
      return true if exam_version.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam_version:, **kwargs)
      exam_version.name = kwargs[:name] if kwargs[:update_name]
      exam_version.instructions = kwargs.dig(:instructions, :value) if kwargs[:update_instructions]
      if kwargs[:update_policies]
        raise GraphQL::ExecutionError, 'Policies cannot be null' unless kwargs[:policies]
        exam_version.policies = kwargs[:policies].join(',')
      end
      if kwargs[:update_files]
        raise GraphQL::ExecutionError, 'Files cannot be null' unless kwargs[:files]
        exam_version.files = kwargs[:files]
      end

      saved = exam_version.save
      raise GraphQL::ExecutionError, exam_version.errors.full_messages.to_sentence unless saved

      { exam_version: exam_version }
    end
  end
end
