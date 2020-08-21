# frozen_string_literal: true

module Types
  class GradingCommentType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :preset_comment, Types::PresetCommentType, null: true
    def preset_comment
      RecordLoader.for(PresetComment).load(object.preset_comment_id)
    end
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false
    field :bnum, Integer, null: false
    field :message, String, null: false
    field :points, Float, null: false
    field :creator, Types::UserType, null: false
    field :preset_comment, Types::PresetCommentType, null: true
  end
end
