module Types
  class StaffRegistrationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :rails_id, Integer, null: false
    delegate :id, to: :object, prefix: :rails

    field :section_id, Integer, null: false
    field :user_id, Integer, null: false
    field :ta, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, CourseType, null: false
    delegate :course, to: :object
  end
end
