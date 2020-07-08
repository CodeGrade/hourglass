module Types
  class AccommodationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :registration, Types::RegistrationType, null: false
    field :new_start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :percent_time_expansion, Integer, null: false

    # field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
