module Types
  class MutationType < Types::BaseObject
    field :update_exam, mutation: Mutations::UpdateExam
  end
end
