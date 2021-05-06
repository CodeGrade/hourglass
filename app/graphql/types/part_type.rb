module Types
  class PartType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :id, ID, null: false

    guard Guards::VISIBILITY

    field :body_items, [Types::BodyItemType], null: false

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
  end
end
