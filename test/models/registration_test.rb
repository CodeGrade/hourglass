# frozen_string_literal: true

require 'test_helper'

class RegistrationTest < ActiveSupport::TestCase
  test 'factory creates valid registration' do
    assert build(:registration).valid?
  end

  test 'accommodated_duration_minutes with no accommodation' do
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
    assert_equal reg.accommodated_end_time.to_i, exam.end_time.to_i
  end

  test 'effective_end_time with no accommodation and no start time' do
    reg = build(:registration)
    assert_equal reg.effective_end_time, reg.accommodated_end_time
  end

  test 'effective_end_time with no accommodation and early start' do
    reg = build(:registration, :early_start)
    exam = reg.exam
    assert_equal reg.effective_end_time, reg.start_time + reg.effective_duration
  end

  test 'early bird start times' do
    reg = build(:registration, :early_start)
    assert_equal reg.start_time, reg.accommodated_start_time
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
    assert_equal reg.exam.end_time.to_i, reg.accommodated_end_time.to_i
    assert_equal reg.exam.end_time.to_i, reg.effective_end_time.to_i
    assert reg.effective_duration < reg.accommodated_duration
  end
end
