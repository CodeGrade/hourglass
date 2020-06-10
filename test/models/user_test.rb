require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'standard user not an admin' do
    assert_not build_stubbed(:user).admin?
  end

  test 'admin factory builds admins' do
    assert build_stubbed(:admin).admin?
  end
end
