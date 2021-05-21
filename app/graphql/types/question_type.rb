module Types
  class QuestionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :parts, [Types::PartType], null: false
    def parts
      AssociationLoader.for(Question, :parts).load(object)
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

    field :extra_credit, Boolean, null: false
    field :separate_subparts, Boolean, null: false
    field :index, Integer, null: false

    field :references, [Types::ReferenceType], null: false
    def references
      AssociationLoader.for(Question, :references).load(object)
    end

    field :rubrics, [Types::RubricType], null: false do
      guard Guards::ALL_STAFF
    end
    def rubrics
      AssociationLoader.for(Question, :rubrics, merge: -> { where(part_id: nil, body_item_id: nil) }).load(object)
    end

    field :root_rubric, Types::RubricType, null: false do
      guard Guards::ALL_STAFF
    end
  end
end
