# frozen_string_literal: true

module Types
  class ExamChecklistSectionType < Types::BaseObject
    field :reason, String, null: false
    field :status, Types::ChecklistItemStatusType, null: false
  end
end
