# frozen_string_literal: true

module Types
  class CourseType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    def self.authorized?(object, context)
      super && object.visible_to?(context[:current_user])
    end

    field :title, String, null: false
    # field :last_sync, GraphQL::Types::ISO8601DateTime, null: true
    field :active, Boolean, null: false
    # field :bottlenose_id, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :exams, [Types::ExamType], null: false
    delegate :exams, to: :object

    field :sections, [Types::SectionType], null: false
    delegate :sections, to: :object
  end
end
