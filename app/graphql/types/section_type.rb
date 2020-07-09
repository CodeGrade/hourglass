# frozen_string_literal: true

module Types
  class SectionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::PROFESSORS

    field :title, String, null: false
    field :students, [Types::UserType], null: false
    field :staff, [Types::UserType], null: false
  end
end
