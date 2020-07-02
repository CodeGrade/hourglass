class HourglassSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  # Opt in to the new runtime (default in future graphql-ruby versions)
  use GraphQL::Execution::Interpreter
  use GraphQL::Analysis::AST

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections

  # Create UUIDs by joining the type name & ID, then base64-encoding it
  def self.id_from_object(object, type_definition, query_ctx)
    GraphQL::Schema::UniqueWithinType.encode(type_definition.graphql_name, object.id)
  end

  def self.object_from_id(id, query_ctx)
    type_name, item_id = GraphQL::Schema::UniqueWithinType.decode(id)
    # Now, based on `type_name` and `item_id`
    # find an object in your application
    Object.const_get(type_name).find(item_id)
  end

  def self.resolve_type(type, obj, ctx)
    case obj
    when User
      Types::UserType
    when Registration
      Types::RegistrationType
    when Course
      Types::CourseType
    when ProctorRegistration
      Types::ProctorRegistrationType
    when ProfessorCourseRegistration
      Types::ProfessorCourseRegistrationType
    when StaffRegistration
      Types::StaffRegistrationType
    when Exam
      Types::ExamType
    when ExamVersion
      Types::ExamVersionType
    else
      raise("Unexpected object: #{obj}")
    end
  end
end
