# frozen_string_literal: true

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'standard user not an admin' do
    assert_not build(:user).admin?
  end

  test 'admin factory builds admins' do
    assert build(:admin).admin?
  end

  test 'cannot create two registrations for the same ExamVersion-User pair' do
    r1 = create(:registration)
    r2 = build(:registration, user: r1.user, exam_version: r1.exam_version)
    assert_not r2.valid?
    assert_match(/has already been taken/, r2.errors.full_messages.to_sentence)
    assert_not r2.save
  end
end
