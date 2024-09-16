# frozen_string_literal: true

require 'test_helper'

class RegistrationTest < ActiveSupport::TestCase
  test 'factory creates valid registration' do
    assert build(:registration).valid?
  end

  test 'create finished registration' do
    reg = build(:registration, :done)
    assert reg.valid?
    assert reg.final?
  end

  test 'accommodated_duration with no accommodation' do
    reg = build(:registration)
    exam = reg.exam
    assert_equal exam.duration, reg.accommodated_duration
  end

  test 'accommodated_start_time with no accommodation' do
    reg = build(:registration)
    exam = reg.exam
    assert_equal reg.accommodated_start_time, exam.start_time
  end

  test 'accommodated_extra_duration with no accommodation' do
    reg = build(:registration)
    assert_equal reg.accommodated_extra_duration, 0
  end

  test 'accommodated_end_time with no accommodation' do
    reg = build(:registration)
    exam = reg.exam
    assert_in_delta reg.accommodated_end_time, exam.end_time, 1.second
  end

  test 'effective_end_time with no accommodation and no start time' do
    reg = build(:registration)
    assert_equal reg.effective_end_time, reg.accommodated_end_time
  end

  test 'effective_end_time with no accommodation and early start' do
    reg = build(:registration, :early_start)
    assert_equal reg.effective_end_time, reg.start_time + reg.effective_duration
  end

  test 'early bird start times' do
    reg = build(:registration, :early_start)
    assert_equal reg.start_time, reg.accommodated_start_time
  end

  test 'early bird start time over' do
    start_time = DateTime.now
    end_time = start_time + 20.minutes
    exam = build(:exam, duration: 8.minutes, start_time:, end_time:)
    ver = build(:exam_version, exam:)
    reg = build(:registration, :early_start, exam_version: ver)
    assert_equal 0, reg.accommodated_extra_duration
    assert_equal 8.minutes, reg.accommodated_duration

    travel_to start_time + 6.minutes
    assert_not reg.over?

    travel_to start_time + 8.minutes - 1.second
    assert_not reg.over?

    travel_to start_time + 8.minutes + 1.second
    assert reg.over?
  end

  test 'normal start times' do
    reg = build(:registration, :normal_start)
    assert reg.start_time > reg.accommodated_start_time
    assert reg.start_time < reg.accommodated_end_time
    assert_equal reg.accommodated_duration, reg.effective_duration
  end

  test 'late start times' do
    reg = build(:registration, :late_start)
    assert reg.start_time > reg.accommodated_start_time
    assert reg.start_time < reg.accommodated_end_time
    assert_in_delta reg.exam.end_time, reg.accommodated_end_time, 1.second
    assert_in_delta reg.exam.end_time, reg.effective_end_time, 1.second
    assert reg.effective_duration < reg.accommodated_duration
  end
end
