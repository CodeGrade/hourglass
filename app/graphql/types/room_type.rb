# frozen_string_literal: true

module Types
  class RoomType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    field :name, String, null: false

    field :registrations, [Types::RegistrationType], null: false do
      guard Guards::PROCTORS_AND_PROFESSORS
    end
    def registrations
      AssociationLoader.for(Room, :registrations).load(object)
    end
    field :proctor_registrations, [Types::ProctorRegistrationType], null: false do
      guard Guards::PROFESSORS
    end
    def proctor_registrations
      AssociationLoader.for(Room, :proctor_registrations).load(object)
    end

    field :room_announcements, Types::RoomAnnouncementType.connection_type, null: false
  end
end
