module Types
  class MutationType < Types::BaseObject
    field :send_message, mutation: Mutations::SendMessage
    field :destroy_anomaly, mutation: Mutations::DestroyAnomaly
    field :finalize_registration, mutation: Mutations::FinalizeRegistration
    field :update_exam, mutation: Mutations::UpdateExam
  end
end
