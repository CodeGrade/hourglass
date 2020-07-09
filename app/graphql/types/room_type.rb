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
    field :proctor_registrations, [Types::ProctorRegistrationType], null: false do
      guard Guards::PROFESSORS
    end

    field :room_announcements, Types::RoomAnnouncementType.connection_type, null: false
  end
end
