require 'test_helper'

class RegistrationTest < ActiveSupport::TestCase
  test 'factory creates valid registration' do
    assert build(:registration).valid?
  end
end
