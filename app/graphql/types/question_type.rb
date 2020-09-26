# frozen_string_literal: true

module Types
  class QuestionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :registration, Types::RegistrationType, null: false
    def registration
      RecordLoader.for(Registration).load(object.registration_id)
    end
    field :urgent, Boolean, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
