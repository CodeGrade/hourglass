require 'test_helper'

class AccommodationTest < ActiveSupport::TestCase
  test 'factory builds valid accommodation' do
    assert build(:accommodation).valid?
  end

  test 'percent_time_expansion is a non-negative integer' do
    assert_not build(:accommodation, percent_time_expansion: -1).valid?
    assert_not build(:accommodation, percent_time_expansion: -1.5).valid?
    assert_not build(:accommodation, percent_time_expansion: 0.2).valid?
    assert_not build(:accommodation, percent_time_expansion: 1.5).valid?

    assert build(:accommodation, percent_time_expansion: 0).valid?
    assert build(:accommodation, percent_time_expansion: 1).valid?
    assert build(:accommodation, percent_time_expansion: 50).valid?
    assert build(:accommodation, percent_time_expansion: 100).valid?
    assert build(:accommodation, percent_time_expansion: 125).valid?
  end

  test 'factor calculation' do
    acc = build(:accommodation, percent_time_expansion: 25)
    assert_equal acc.factor, 1.25

    acc.percent_time_expansion = 0
    assert_equal acc.factor, 1

    acc.percent_time_expansion = 100
    assert_equal acc.factor, 2
  end

  test 'accommodated duration with expansion' do
    acc = build(:accommodation, percent_time_expansion: 25)
    reg = acc.registration
    exam = reg.exam
    extra_duration = exam.duration / 4.0
    assert_equal extra_duration, reg.accommodated_extra_duration
    assert_equal exam.duration + extra_duration, reg.accommodated_duration
  end

  test 'accommodated duration with expansion and real values' do
    start_time = DateTime.now
    end_time = start_time + 20.minutes
    exam = build(:exam, duration: 8.minutes, start_time: start_time, end_time: end_time)
    reg = build(:registration, :early_start, exam: exam)
    acc = build(:accommodation, registration: reg, percent_time_expansion: 25)
    extra_duration = 2.minutes
    assert_equal extra_duration, reg.accommodated_extra_duration
    assert_equal 10.minutes, reg.accommodated_duration

    travel_to start_time + 6.minutes
    assert_not reg.over?

    travel_to start_time + 9.minutes
    assert_not reg.over?

    travel_to start_time + 10.minutes + 1.second
    assert reg.over?
  end

  test 'accommodated end time with expansion' do
    acc = build(:accommodation, percent_time_expansion: 25)
    reg = acc.registration
    exam = reg.exam
    extra_duration = exam.duration / 4.0
    assert_equal exam.end_time + extra_duration, reg.accommodated_end_time
  end

  test 'start time is updated to accommodated start time' do
    reg = build(:registration)
    exam = reg.exam
    new_start_time = exam.start_time - 1.hour
    acc = build(:accommodation, registration: reg, new_start_time: new_start_time)
    assert_equal new_start_time, reg.accommodated_start_time
  end

  test 'end time is adjusted by factor' do
    acc = build(:accommodation, percent_time_expansion: 25)
    reg = acc.registration
    exam = reg.exam
    extra_duration = exam.duration / 4.0
    assert_equal exam.start_time, reg.accommodated_start_time
    assert_equal (exam.end_time + extra_duration), reg.accommodated_end_time
  end

  test 'full time remaining for an early start' do
    reg = build(:registration, :early_start)
    exam = reg.exam
    acc = build(:accommodation, registration: reg, percent_time_expansion: 25)
    extra_duration = exam.duration / 4.0
    assert_equal exam.duration + extra_duration, reg.accommodated_duration
    assert_equal reg.accommodated_duration, reg.effective_duration
  end

  test 'more time remaining for a late start with accommodation' do
    reg = build(:registration, :late_start)
    exam = reg.exam
    acc = build(:accommodation, registration: reg, percent_time_expansion: 50)
    acc.save

    # # The student has 50% more time, and that same amount of extra time added to their window.
    extra_duration = exam.duration / 2.0

    assert_equal exam.duration + extra_duration, reg.accommodated_duration
    assert_equal exam.end_time + extra_duration, reg.accommodated_end_time

    assert_equal reg.accommodated_end_time - (reg.accommodated_duration / 2.0), reg.start_time

    assert_equal (exam.end_time + extra_duration), reg.accommodated_end_time
    assert_equal reg.accommodated_end_time, reg.effective_end_time

    # The student has 1/2 of their total time to take the exam.
    # Regular late start has 1/4 of their time, but this student has 50% more time.
    assert_equal reg.accommodated_duration / 2.0, reg.effective_duration
  end
end
