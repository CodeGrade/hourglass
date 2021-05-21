# frozen_string_literal: true

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

    field :rubric_preset, GraphQL::Schema::LateBoundType.new('RubricPreset'), null: false
    def rubric_preset
      RecordLoader.for(RubricPreset).load(object.rubric_preset_id)
    end

    field :in_use, Boolean, null: false
    def in_use
      object.in_use?
    end
  end

  class RubricPresetType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :label, String, null: true
    field :direction, Types::RubricDirectionType, null: false
    field :mercy, Float, null: true

    field :preset_comments, [Types::PresetCommentType], null: false
    def preset_comments
      AssociationLoader.for(RubricPreset, :preset_comments).load(object)
    end

    field :rubric, GraphQL::Schema::LateBoundType.new('Rubric'), null: false
    def rubric
      RecordLoader.for(Rubric).load(object.rubric_id)
    end

    field :in_use, Boolean, null: false
    def in_use
      object.in_use?
    end
  end

  class RubricType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :type, Types::RubricVariantType, null: false
    def type
      object.type.downcase
    end

    field :qnum, Integer, null: true
    def qnum
      object.question&.index
    end
    field :pnum, Integer, null: true
    def pnum
      object.part&.index
    end
    field :bnum, Integer, null: true
    def bnum
      object.body_item&.index
    end
    field :order, Integer, null: true

    field :points, Float, null: true
    field :description, Types::HtmlType, null: true
    def description
      object.description && {
        type: 'HTML',
        value: object.description,
      }
    end

    field :parent_section, Types::RubricType, null: true
    def parent_section
      AssociationLoader.for(Rubric, :parent_section).load(object)
    end

    field :exam_version, Types::ExamVersionType, null: false
    field :question, Types::QuestionType, null: true
    field :part, Types::PartType, null: true
    field :body_item, Types::BodyItemType, null: true

    field :subsections, [Types::RubricType], null: true
    def subsections
      AssociationLoader.for(Rubric, :subsections).load(object)
    end
    field :all_subsections, [Types::RubricType], null: false
    def all_subsections
      AssociationLoader.for(Rubric, :descendants).load(object)
    end

    field :rubric_preset, Types::RubricPresetType, null: true
    def rubric_preset
      AssociationLoader.for(Rubric, :rubric_preset).load(object)
    end

    field :in_use, Boolean, null: false
    def in_use
      object.in_use?
    end
  end
end
