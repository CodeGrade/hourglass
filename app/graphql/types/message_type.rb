module Types
  class MessageType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :rails_id, Integer, null: false
    delegate :id, to: :object, prefix: :rails

    field :exam, Types::ExamType, null: false
    field :sender, Types::UserType, null: false
    field :recipient, Types::UserType, null: false

    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end