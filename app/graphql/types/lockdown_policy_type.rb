module Types
  class LockdownPolicyType < Types::BaseEnum
    value 'IGNORE_LOCKDOWN', "don't install anomaly handlers"
    value 'TOLERATE_WINDOWED', 'allow the browser to not be fullscreen'
  end
end
