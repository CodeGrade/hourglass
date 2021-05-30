module Types
  class ReferenceTypeType < Types::BaseEnum
    value 'file'
    value 'dir'
  end

  class ReferenceType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :path, String, null: false
    field :type, ReferenceTypeType, null: false
  end

  class ReferenceInputType < Types::BaseInputObject
    argument :path, String, required: true
    argument :type, ReferenceTypeType, required: true
  end
end
