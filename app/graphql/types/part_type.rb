module Types
  class PartType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :body_items, [Types::BodyItemType], null: false
    def body_items
      AssociationLoader.for(Part, :body_items).load(object)
    end

    field :name, Types::HtmlType, null: true
    def name
      object.name && {
        type: 'HTML',
        value: object.name,
      }
    end

    field :description, Types::HtmlType, null: true
    def description
      object.description && {
        type: 'HTML',
        value: object.description,
      }
    end

    field :points, Float, null: false
    field :extra_credit, Boolean, null: false
    field :index, Integer, null: false

    field :references, [Types::ReferenceType], null: false
    def references
      AssociationLoader.for(Part, :references).load(object)
    end

    field :rubrics, [Types::RubricType], null: false do
      guard Guards::ALL_STAFF
    end
  end
end
