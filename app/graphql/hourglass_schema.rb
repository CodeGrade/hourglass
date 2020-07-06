require 'graphql/subscriptions/action_cable_subscriptions'

class HourglassSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
  subscription(Types::SubscriptionType)

  use GraphQL::Execution::Interpreter
  use GraphQL::Analysis::AST

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections

  use GraphQL::Subscriptions::ActionCableSubscriptions

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
    when Accommodation
      Types::AccommodationType
    when Anomaly
      Types::AnomalyType
    when Course
      Types::CourseType
    when ExamAnnouncement
      Types::ExamAnnouncementType
    when Exam
      Types::ExamType
    when ExamVersion
      Types::ExamVersionType
    when Message
      Types::MessageType
    when ProctorRegistration
      Types::ProctorRegistrationType
    when ProfessorCourseRegistration
      Types::ProfessorCourseRegistrationType
    when Question
      Types::QuestionType
    when Registration
      Types::RegistrationType
    when RoomAnnouncement
      Types::RoomAnnouncementType
    when Room
      Types::RoomType
    when Section
      Types::SectionType
    when StaffRegistration
      Types::StaffRegistrationType
    when User
      Types::UserType
    when VersionAnnouncement
      Types::VersionAnnouncementType
    else
      raise("Unexpected object: #{obj}")
    end
  end

  def self.write_json!
    File.open('app/javascript/relay/data/schema.json', 'w') do |f|
      f.write(execute(GraphQL::Introspection::INTROSPECTION_QUERY).to_json)
    end
  end

  def self.do_mutation!(mutation_query, user, input)
    execute(mutation_query, context: { current_user: user }, variables: {
      input: input,
    })
  end
end
