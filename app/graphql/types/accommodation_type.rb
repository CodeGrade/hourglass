# frozen_string_literal: true

module Types
  class AccommodationType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard Guards::VISIBILITY

    description 'Accommodates a student with additional/alternate times, or alternate policies.'

    field :registration, Types::RegistrationType, null: false
    def registration
      RecordLoader.for(Registration).load(object.registration_id)
    end
    field :new_start_time, GraphQL::Types::ISO8601DateTime, null: true
    field :percent_time_expansion, Integer, null: false
    field :policy_exemptions, [Types::PolicyExemptionType], null: true
  end
end
