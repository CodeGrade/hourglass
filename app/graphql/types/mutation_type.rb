module Types
  class MutationType < Types::BaseObject
    field :destroy_accommodation, mutation: Mutations::DestroyAccommodation
    field :update_accommodation, mutation: Mutations::UpdateAccommodation
    field :create_accommodation, mutation: Mutations::CreateAccommodation
    field :create_exam, mutation: Mutations::CreateExam
    field :finalize_item, mutation: Mutations::FinalizeItem
    field :send_message, mutation: Mutations::SendMessage
    field :destroy_anomaly, mutation: Mutations::DestroyAnomaly
    field :update_exam, mutation: Mutations::UpdateExam
  end
end
