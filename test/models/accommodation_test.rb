require 'test_helper'

class AccommodationTest < ActiveSupport::TestCase
  test 'factory builds valid accommodation' do
    assert build(:accommodation).valid?
  end
end
