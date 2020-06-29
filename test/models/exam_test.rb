# frozen_string_literal: true

require 'test_helper'

class ExamTest < ActiveSupport::TestCase
  test 'exam factory builds valid exam' do
    assert build(:exam).valid?
  end

  test 'build exam with finished students' do
    exam = build(:exam, :with_finished_submissions, submissions_count: 10)
    assert exam.valid?
    assert 10, exam.registrations.count
    assert exam.registrations.all?(&:finished)
  end

  test 'exam time_window calculation' do
    start = DateTime.now
    exam = create(
      :exam,
      start_time: start,
      end_time: start + 30.minutes,
      duration: 29.minutes
    )
    assert_equal 30.minutes, exam.time_window
  end

  test 'exam with duration shorter than time period is valid' do
    start = DateTime.now
    exam = create(
      :exam,
      start_time: start,
      end_time: start + 30.minutes,
      duration: 29.minutes
    )
    assert exam.valid?
  end

  test 'exam with duration longer than time period is invalid' do
    start = DateTime.now
    bad_exam = build(
      :exam,
      start_time: start,
      end_time: start + 30.minutes,
      duration: 31.minutes
    )
    assert_equal 30.minutes, bad_exam.time_window
    assert_not bad_exam.valid?
    assert_match(/longer than/, bad_exam.errors[:duration].first)
  end
end
