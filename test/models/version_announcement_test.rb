# frozen_string_literal: true

require 'test_helper'

class VersionAnnouncementTest < ActiveSupport::TestCase
  def setup
    @version = create(:exam_version)
  end
  test 'factory creates valid version announcement' do
    assert build(:version_announcement, exam_version: @version).valid?
  end

  test 'should save valid announcement' do
    announcement = build(:version_announcement, exam_version: @version)
    assert announcement.save
  end

  test 'should not save announcement without body' do
    announcement = build(:version_announcement, exam_version: @version, body: '')
    assert_not announcement.save
  end
end
