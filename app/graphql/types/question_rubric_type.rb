module Types
  class RubricPresetType < Types::BaseObject
    field :description, Types::HtmlType, null: false
    field :points, Float, null: false
  end

  class MercyScopeType < Types::BaseEnum
    value 'exam'
    value 'question'
    value 'part'
  end

  class MercyType < Types::BaseObject
    field :scope, Types::MercyScopeType, null: false
    field :limit, Float, null: false
  end

  class ItemRubricDirectionType < Types::BaseEnum
    value 'credit'
    value 'deduction'
  end

  class ItemRubricType < Types::BaseObject
    field :points, Float, null: false
    field :label, String, null: false
    field :description, Types::HtmlType, null: false
    field :direction, Types::ItemRubricDirectionType, null: false
    field :mercy, Types::MercyType, null: true
    field :presets, [Types::RubricPresetType], null: true
  end

  class RubricType < Types::BaseUnion
  end

  class ConditionalRubricType < Types::BaseObject
    field :condition, Types::HtmlType, null: false
    field :rubrics, [Types::RubricType], null: false
  end

  class RubricType < Types::BaseUnion
    possible_types Types::ItemRubricType, Types::ConditionalRubricType

    def self.resolve_type(object, _ctx)
      if object.key? 'condition'
        Types::ConditionalRubricType
      else
        Types::ItemRubricType
      end
    end
  end

  class BodyRubricType < Types::BaseObject
    field :rubrics, [Types::RubricType], null: false
  end

  class PartRubricType < Types::BaseObject
    field :part, [Types::RubricType], null: false
    field :body, [Types::BodyRubricType], null: false
  end

  class QuestionRubricType < Types::BaseObject
    field :parts, [Types::PartRubricType], null: false
  end
end
