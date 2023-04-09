# frozen_string_literal: true

module Types
  class PolicyExemptionType < Types::BaseEnum
    value 'IGNORE_LOCKDOWN', "don't install anomaly handlers"
    value 'TOLERATE_WINDOWED', 'allow the browser to not be fullscreen'
    value 'IGNORE_PIN', "don't require a PIN to unlock the exam"
  end
end
