module Types
  class MutationType < Types::BaseObject
    field :destroy_anomaly, mutation: Mutations::DestroyAnomaly
    field :finalize_registration, mutation: Mutations::FinalizeRegistration
    field :update_exam, mutation: Mutations::UpdateExam
  end
end
