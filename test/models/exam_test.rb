require 'test_helper'

class ExamTest < ActiveSupport::TestCase
  test 'exam factory builds valid exam' do
    assert build(:exam).valid?
  end

  test 'exam with duration shorter than time period is valid' do
    start = DateTime.now
    exam = create(
      :exam,
      start_time: start,
      end_time: start + 30.minutes,
      duration: 29
    )
    assert exam.valid?
  end

  test 'exam with duration longer than time period is invalid' do
    start = DateTime.now
    bad_exam = build(
      :exam,
      start_time: start,
      end_time: start + 30.minutes,
      duration: 31
    )
    assert_equal bad_exam.time_window_minutes, 30
    assert_not bad_exam.valid?
    assert_match(/longer than/, bad_exam.errors[:duration].first)
  end
end
