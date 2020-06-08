# frozen_string_literal: true

require 'test_helper'

class VersionAnnouncementTest < ActiveSupport::TestCase
  test 'should save valid announcement' do
    announcement = VersionAnnouncement.new(
      exam_version: exam_versions(:cs2500midterm_1),
      body: 'This is a valid announcement'
    )
    assert announcement.save
  end

  test 'should not save announcement without body' do
    announcement = VersionAnnouncement.new(
      exam_version: exam_versions(:cs2500midterm_1),
      body: ''
    )
    assert_not announcement.save
  end
end
