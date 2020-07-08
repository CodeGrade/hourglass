module Types
  class RoomType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    # field :exam_id, Integer, null: false
    field :name, String, null: false
    field :registrations, [Types::RegistrationType], null: false
    field :proctor_registrations, [Types::ProctorRegistrationType], null: false
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
