# frozen_string_literal: true

module Types
  class LockdownPolicyType < Types::BaseEnum
    value 'IGNORE_LOCKDOWN', "don't install anomaly handlers"
    value 'TOLERATE_WINDOWED', 'allow the browser to not be fullscreen'
    value 'MOCK_LOCKDOWN', 'install warning anomaly handlers'
    value 'STUDENT_PIN', 'require PIN for students to log in'
  end
end
