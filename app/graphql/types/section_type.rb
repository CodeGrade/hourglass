# frozen_string_literal: true

module Types
  class SectionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::PROFESSORS

    field :title, String, null: false
    field :students, [Types::UserType], null: false
    def students
      AssociationLoader.for(Section, :students, merge: -> { order(display_name: :asc) }).load(object)
    end
    field :staff, [Types::UserType], null: false
    def staff
      AssociationLoader.for(Section, :staff, merge: -> { order(display_name: :asc) }).load(object)
    end
  end
end
