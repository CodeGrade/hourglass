require 'graphql/subscriptions/action_cable_subscriptions'
require 'graphql/batch'

class HourglassSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
  subscription(Types::SubscriptionType)

  use GraphQL::Execution::Interpreter
  use GraphQL::Analysis::AST
  use GraphQL::Batch

  use GraphQL::Guard.new(
    not_authorized: lambda do |type, field|
      GraphQL::ExecutionError.new("Not authorized to access #{type}.#{field}")
    end,
  )

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections

  use GraphQL::Subscriptions::ActionCableSubscriptions

  # Create UUIDs by joining the type name & ID, then base64-encoding it
  def self.id_from_object_id(object_id, type_definition, _query_ctx)
    GraphQL::Schema::UniqueWithinType.encode(type_definition.graphql_name, object_id)
  end
  def self.id_from_object(object, type_definition, _query_ctx)
    self.id_from_object_id(object.id, type_definition, _query_ctx)
  end

  def self.object_from_id(id, _query_ctx)
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
    when GradingCheck
      Types::GradingCheckType
    when GradingComment
      Types::GradingCommentType
    when GradingLock
      Types::GradingLockType
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
    when Rubric
      Types::RubricType
    when RubricPreset
      Types::RubricPresetType
    when PresetComment
      Types::PresetCommentType
    else
      raise("Unexpected object of type '#{type}': #{obj}")
    end
  end

  def self.unauthorized_object(error)
    # Add a top-level error to the response instead of returning nil:
    typ = error.type.graphql_name
    raise GraphQL::ExecutionError, "You do not have permission to view that #{typ}."
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
