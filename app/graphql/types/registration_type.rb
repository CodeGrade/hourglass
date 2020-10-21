# frozen_string_literal: true

module Types
  class RegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    ALL_STAFF_OR_PUBLISHED = lambda { |obj, args, ctx|
      return true if Guards::ALL_STAFF.call(obj, args, ctx)
      return false unless obj.object.user == ctx[:current_user]
      return obj.object.published
    }  

    field :room, Types::RoomType, null: true
    def room
      RecordLoader.for(Room).load(object.room_id)
    end
    field :start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :end_time, GraphQL::Types::ISO8601DateTime, null: true

    field :user, Types::UserType, null: false
    def user
      RecordLoader.for(User).load(object.user_id)
    end
    field :exam, Types::ExamType, null: false
    # field :exam_version, Types::ExamVersionType, null: true
    # def exam_version
    #   return object.exam_version if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
    #   return nil if object.in_future?
    #   return nil unless object.published?
    #   return nil if object.over?
      
    #   return object.exam_version
    # end
    field :exam_version, Types::ExamVersionType, null: false do
      guard lambda { |obj, _args, ctx|
        !obj.object.in_future?
      }
    end
    def exam_version
      RecordLoader.for(ExamVersion).load(object.exam_version_id)
    end


    field :review_exam, GraphQL::Types::JSON, null: true 
    def review_exam
      if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
        ev = object.exam_version
        {
          questions: ev.questions,
          reference: ev.reference,
          instructions: ev.instructions,
          files: ev.files,
        }
      else
        nil
      end
    end

    field :course_title, String, null: false
    def course_title
      object.exam.course.title
    end
    field :exam_name, String, null: false
    def exam_name
      object.exam.name
    end
    field :accommodated_start_time, GraphQL::Types::ISO8601DateTime, null: false
    def accommodated_start_time
      object.accommodated_start_time
    end

    field :can_i_grade, Boolean, null: false
    def can_i_grade
      Guards::ALL_STAFF.call(self, nil, context)
    end

    field :current_answers, GraphQL::Types::JSON, null: true
    def current_answers
      if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
        object.current_answers
      else
        nil
      end
    end

    field :current_grading, GraphQL::Types::JSON, null: true
    def current_grading
      if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
        object.current_grading
      else
        nil
      end
    end

    field :grading_checks, [Types::GradingCheckType], null: true
    def grading_checks
      if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
        AssociationLoader.for(Registration, :grading_checks).load(object)
      else
        nil
      end
    end

    field :grading_comments, Types::GradingCommentType.connection_type, null: true
    def grading_comments
      if ALL_STAFF_OR_PUBLISHED.call(self, nil, context)
        AssociationLoader.for(Registration, :grading_comments).load(object)
      else
        nil
      end
    end

    field :anomalous, Boolean, null: false
    def anomalous
      object.anomalous?
    end

    field :started, Boolean, null: false
    def started
      object.started?
    end

    field :available, Boolean, null: false
    def available
      object.available?
    end

    field :in_future, Boolean, null: false
    def in_future
      object.in_future?
    end

    field :over, Boolean, null: false
    def over
      object.over?
    end

    field :final, Boolean, null: false
    def final
      object.final?
    end

    field :published, Boolean, null: false
    def published
      object.published?
    end

    field :last_snapshot, GraphQL::Types::ISO8601DateTime, null: true
    def last_snapshot
      object.snapshots.last&.created_at
    end

    field :questions, Types::QuestionType.connection_type, null: false
    def questions
      object.questions.order(created_at: :desc)
    end

    field :messages, Types::MessageType.connection_type, null: false
    def messages
      object.messages.order(created_at: :desc)
    end
  end
end
