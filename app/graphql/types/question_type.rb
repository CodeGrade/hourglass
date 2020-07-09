# frozen_string_literal: true

module Types
  # TODO: should only be visible to profs of the course, proctors of the exam, and reg.user
  class QuestionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :registration, Types::RegistrationType, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
