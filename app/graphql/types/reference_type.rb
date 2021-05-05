module Types
  class ReferenceType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :id, ID, null: false

    field :path, String, null: false
    field :type, String, null: false
  end
end
