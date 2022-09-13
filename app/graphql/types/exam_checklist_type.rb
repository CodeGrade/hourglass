# frozen_string_literal: true

module Types
  class ExamChecklistType < Types::BaseObject
    field :rooms, Types::ExamChecklistSectionType, null: false
    field :timing, Types::ExamChecklistSectionType, null: false
    field :staff, Types::ExamChecklistSectionType, null: false
    field :seating, Types::ExamChecklistSectionType, null: false
    field :versions, Types::ExamChecklistSectionType, null: false
  end
end
