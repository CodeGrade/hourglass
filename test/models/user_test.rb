require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'standard user not an admin' do
    assert_not build(:user).admin?
  end

  test 'user factory builds admins' do
    assert build(:user, :admin).admin?
  end
end
