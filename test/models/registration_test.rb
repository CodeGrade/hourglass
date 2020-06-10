require 'test_helper'

class RegistrationTest < ActiveSupport::TestCase
  test 'factory creates valid registration' do
    assert create(:registration).valid?
  end
end
