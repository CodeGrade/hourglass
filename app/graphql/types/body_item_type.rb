module Types
  class BodyItemType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :info, GraphQL::Types::JSON, null: false
    field :index, Integer, null: false

    field :answer, GraphQL::Types::JSON, null: true do
      guard Guards::ALL_STAFF
    end
    def answer
      if object.info['type'] == "Matching"
        object.answer.map{|i| i || -1}
      else
        object.answer
      end
    end

    field :rubrics, [Types::RubricType], null: false do
      guard Guards::ALL_STAFF
    end
    def rubrics
      AssociationLoader.for(BodyItem, :rubrics).load(object)
    end

    field :root_rubric, Types::RubricType, null: false do
      guard Guards::ALL_STAFF
    end
  end
end
