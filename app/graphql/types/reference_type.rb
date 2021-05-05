module Types
  class ReferenceTypeType < Types::BaseEnum
    value 'file', value: :file
    value 'dir', value: :dir
  end

  class ReferenceType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :id, ID, null: false

    field :path, String, null: false
    field :type, ReferenceTypeType, null: false
  end
end
