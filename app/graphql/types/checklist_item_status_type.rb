# frozen_string_literal: true

module Types
  class ChecklistItemStatusType < Types::BaseEnum
    value 'NOT_STARTED', value: :not_started
    value 'COMPLETE', value: :complete
    value 'NA', value: :na
    value 'WARNING', value: :warning
  end
end
