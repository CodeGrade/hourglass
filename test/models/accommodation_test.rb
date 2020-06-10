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

  test 'start time is updated to accommodated start time' do
    reg = build(:registration)
    exam = reg.exam
    new_start_time = exam.start_time - 1.hour
    acc = build(:accommodation, registration: reg, new_start_time: new_start_time)
    assert_equal new_start_time.to_i, reg.accommodated_start_time.to_i
  end

  test 'end time is adjusted by factor' do
    acc = build(:accommodation, percent_time_expansion: 25)
    reg = acc.registration
    exam = reg.exam
    extra_duration = exam.duration / 4.0
    assert_equal exam.start_time.to_i, reg.accommodated_start_time.to_i
    assert_equal (exam.end_time + extra_duration).to_i, reg.accommodated_end_time.to_i
  end
end
