# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :username, String, null: false
    field :display_name, String, null: false
    field :nuid, Integer, null: true
    field :email, String, null: false
    field :image_url, String, null: true
    def image_url
      object.full_bottlenose_image_url
    end
    field :admin, Boolean, null: false

    field :is_me, Boolean, null: false
    def is_me
      object == context[:current_user]
    end
  end
end
