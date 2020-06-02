# frozen_string_literal: true

require 'test_helper'

class ExamExamAnnouncementTest < ActiveSupport::TestCase
  test 'should save valid announcement' do
    announcement = ExamAnnouncement.new(
      exam: exams(:cs2500midterm),
      body: 'This is a valid announcement'
    )
    assert announcement.save
  end

  test 'should not save announcement without body' do
    announcement = ExamAnnouncement.new(
      exam: exams(:cs2500midterm),
      body: ''
    )
    assert_not announcement.save
  end
end
