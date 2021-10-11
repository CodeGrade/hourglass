# frozen_string_literal: true

require 'graphql/subscriptions/action_cable_subscriptions'
require 'graphql/batch'

# Class that actually executes all Hourglass GraphQL queries
class HourglassSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
  subscription(Types::SubscriptionType)

  use GraphQL::Batch


  # Feedback and error messages in development mode will be 
  # more informative than in production/test modes.
  if Rails.env.development?
    use GraphQL::Guard.new(
      not_authorized:  lambda do |type, field|
        GraphQL::ExecutionError.new("Not authorized to access #{type}.#{field}")
      end,
    )

    def self.unauthorized_object(error)
      # Add a top-level error to the response instead of returning nil:
      typ = error.type.graphql_name
      raise GraphQL::ExecutionError, "You do not have permission to view that #{typ}."
    end

    # In dev mode, permit non-persisted queries, but warn
    def self.execute(query_str = nil, **kwargs)
      query_str = kwargs[:query] if query_str.nil?
      if STATIC_GRAPHQL_QUERIES[query_str].nil? && KNOWN_GRAPHQL_QUERIES[query_str].nil?
        Rails.logger.debug "** GraphQL: Received non-persisted query: >#{query_str}<"
      elsif KNOWN_GRAPHQL_QUERIES[query_str].nil?
        query_str = STATIC_GRAPHQL_QUERIES[query_str]
      end
      super(query_str, **kwargs)
    end
  else
    use GraphQL::Guard.new(
      not_authorized:  lambda do |type, field|
        GraphQL::ExecutionError.new("You do not have permission to view that data.")
      end,
    )
  
    def self.unauthorized_object(error)
      # Add a top-level error to the response instead of returning nil:
      raise GraphQL::ExecutionError, "You do not have permission to view that data."
    end

    # In production or test mode, only permit persisted queries
    def self.execute(query_str = nil, **kwargs)
      query_str = kwargs[:query] if query_str.nil?
      query_str = STATIC_GRAPHQL_QUERIES[query_str] if KNOWN_GRAPHQL_QUERIES[query_str].nil?
      super(query_str, **kwargs)
    end
  end

  use GraphQL::Subscriptions::ActionCableSubscriptions

  # Create UUIDs by joining the type name & ID, then base64-encoding it
  def self.id_from_object_id(object_id, type_definition, _query_ctx)
    GraphQL::Schema::UniqueWithinType.encode(type_definition.graphql_name, object_id)
  end

  def self.id_from_object(object, type_definition, query_ctx)
    id_from_object_id(object.id, type_definition, query_ctx)
  end

  def self.object_from_id(id, _query_ctx)
    type_name, item_id = GraphQL::Schema::UniqueWithinType.decode(id)
    # Now, based on `type_name` and `item_id`
    # find an object in your application
    Object.const_get(type_name).find(item_id)
  rescue ActiveRecord::RecordNotFound => e
    if Rails.env.development?
      raise GraphQL::ExecutionError, "Cannot find #{type_name} with id #{item_id}."
    else
      raise GraphQL::ExecutionError, "You do not have permission to view that data."
    end
  rescue RuntimeError => e
    Rails.logger.debug "Object_from_id: #{id} ==> #{e.message}\n#{e.backtrace.join("\n")}"
    raise GraphQL::ExecutionError, "Unknown error while trying to access #{type_name} #{item_id}: #{e.message}."
  end

  def self.objects_from_ids(ids, _query_ctx)
    to_load = ids.map { |id| GraphQL::Schema::UniqueWithinType.decode(id) }.group_by(&:first)
    to_load.map do |type_name, item_ids|
      begin
        # Now, based on `type_name` and `item_id`
        # find an object in your application
        ans = Object.const_get(type_name).where(id: item_ids.map(&:second)).to_a
        if ans.length != item_ids.length
          if Rails.env.development?
            missing = item_ids.to_set - ans.map(&:id)
            raise GraphQL::ExecutionError, "Cannot find #{type_name} with ids #{missing.to_a}."
          else
            raise GraphQL::ExecutionError, "You do not have permission to view that data."
          end
        end
        ans
      end
    end.flatten
  rescue ActiveRecord::RecordNotFound => e
    raise GraphQL::ExecutionError, "You do not have permission to view that data"
  rescue RuntimeError => e
    Rails.logger.debug "Object_from_id: #{id} ==> #{e.message}\n#{e.backtrace.join("\n")}"
    raise GraphQL::ExecutionError, "Unknown error while trying to access #{type_name} #{item_id}: #{e.message}."
  end


  def self.resolve_type(type, obj, _ctx)
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
    when StudentQuestion
      Types::StudentQuestionType
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
    when Term
      Types::TermType
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
    when Question
      Types::QuestionType
    when Part
      Types::PartType
    when BodyItem
      Types::BodyItemType
    when Reference
      Types::ReferenceType
    else
      raise("Unexpected object of type '#{type}': #{obj}")
    end
  end

  def self.write_json!
    File.open('app/packs/relay/data/schema.json', 'w') do |f|
      f.write(execute(GraphQL::Introspection::INTROSPECTION_QUERY).to_json)
    end
  end

  def self.do_mutation!(mutation_query, user, input)
    execute(
      mutation_query,
      context: {
        current_user: user,
        access_cache: {},
        skip_eager_fields: false,
      },
      variables: {
        input: input,
      },
    )
  end
end
