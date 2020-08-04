module Types
  class RubricVariantType < Types::BaseEnum
    value 'all'
    value 'any'
    value 'one'
    value 'none'
  end

  class RubricDirectionType < Types::BaseEnum
    value 'credit'
    value 'deduction'
  end

  class PresetCommentType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :label, String, null: true
    field :grader_hint, String, null: false
    field :student_feedback, String, null: true
    field :points, Float, null: false
    field :order, Integer, null: true
  end

  class RubricPresetType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :label, String, null: true
    field :direction, Types::RubricDirectionType, null: false
    field :mercy, Float, null: true

    field :preset_comments, [Types::PresetCommentType], null: false
  end

  class RubricType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :type, Types::RubricVariantType, null: false
    def type
      object.type.downcase
    end

    field :qnum, Integer, null: true
    field :pnum, Integer, null: true
    field :bnum, Integer, null: true
    field :order, Integer, null: true

    field :points, Float, null: true
    field :description, Types::HtmlType, null: true
    def description
      {
        type: 'HTML',
        value: object.description
      }
    end
    
    field :subsections, [Types::RubricType], null: true
    field :rubric_preset, Types::RubricPresetType, null: true
  end
end
