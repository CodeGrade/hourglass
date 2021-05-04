# frozen_string_literal: true

require 'test_helper'

class GradingCheckTest < ActiveSupport::TestCase
  def setup
    @course = create(:course)
    @section = create(:section, course: @course)
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @reg = create(:registration, exam_version: @version)
    @reg2 = create(:registration, exam_version: @version)
    @grader = create(:user)
    @staff_reg = create(:staff_registration, user: @grader, section: @section)
    @check = create(:grading_check, creator: @grader, registration: @reg)
  end

  test 'grading check factory' do
    assert @check.valid?
  end

  test 'grading check with zero points is valid' do
    assert build(:grading_check, registration: @reg2, points: 0).valid?
  end

  test 'grading check with bonus is valid' do
    assert build(:grading_check, registration: @reg2, points: 5).valid?
  end

  test 'grading check with deduction is valid' do
    assert build(:grading_check, registration: @reg2, points: -5).valid?
  end

  test 'invalid qnum' do
    second_version = create(:exam_version, exam: @exam)
    bad = build(:grading_check, question: second_version.db_questions.first)
    assert_not bad.valid?
    assert_match(/must be self-consistent/, bad.errors.full_messages.to_sentence)
  end

  test 'two checks on same bnum is invalid' do
    bad = build(:grading_check, registration: @reg, body_item: @check.body_item)
    assert_not bad.valid?
    assert_match(/already exists/, bad.errors.full_messages.to_sentence)
  end
end
