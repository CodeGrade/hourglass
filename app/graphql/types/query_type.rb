module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.
    add_field(GraphQL::Types::Relay::NodeField)
    add_field(GraphQL::Types::Relay::NodesField)
    
    field :me, UserType, null: false
    def me
      context[:current_user]
    end

    field :exam, ExamType, null: false do
      argument :rails_id, Int, required: false
      argument :id, ID, required: false
    end

    def exam(rails_id: nil, id: nil)
      if rails_id
        Exam.find(rails_id)
      elsif id
        HourglassSchema.object_from_id(id, context)
      else
        raise GraphQL::ExecutionError, 'Bad exam ID.'
      end
    end

    field :exam_version, ExamVersionType, null: false do
      argument :rails_id, Integer, required: true
    end

    def exam_version(rails_id:)
      ExamVersion.find(rails_id)
    end

    field :course, CourseType, null: false do
      argument :rails_id, Integer, required: true
    end

    def course(rails_id:)
      Course.find(rails_id)
    end

    # field :courses, [CourseType], null: false
    # def courses
    #   Course.all
    # end

    # field :users, [UserType], null: false
    # def users
    #   User.all
    # end

    # field :registrations, [RegistrationType], null: false
    # def registrations
    #   Registration.all
    # end

    # field :user, UserType, null: false do
    #   argument :username, String, required: true
    # end

    # def user(username:)
    #   User.find_by(username: username)
    # end
  end
end
