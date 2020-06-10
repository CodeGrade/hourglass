# frozen_string_literal: true

require 'test_helper'

class VersionAnnouncementTest < ActiveSupport::TestCase
  test 'factory creates valid version announcement' do
    assert build(:version_announcement).valid?
  end

  test 'should save valid announcement' do
    announcement = build(:version_announcement)
    assert announcement.save
  end

  test 'should not save announcement without body' do
    announcement = build(:version_announcement, body: '')
    assert_not announcement.save
  end
end
