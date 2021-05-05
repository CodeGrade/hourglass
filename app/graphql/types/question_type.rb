module Types
  class QuestionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :id, ID, null: false

    guard Guards::VISIBILITY

    field :parts, [Types::PartType], null: false

    field :name, String, null: true
    field :description, String, null: true
    field :extra_credit, Boolean, null: false
    field :separate_subparts, Boolean, null: false
    field :index, Integer, null: false

    field :references, [Types::ReferenceType], null: false
  end
end
