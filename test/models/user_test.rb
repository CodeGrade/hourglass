# frozen_string_literal: true

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'standard user not an admin' do
    assert_not build(:user).admin?
  end

  test 'admin factory builds admins' do
    assert build(:admin).admin?
  end
end
