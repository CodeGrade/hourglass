module Types
  class MutationType < Types::BaseObject
    field :finalize_registration, mutation: Mutations::FinalizeRegistration
    field :update_exam, mutation: Mutations::UpdateExam
  end
end
