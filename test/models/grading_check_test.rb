# frozen_string_literal: true

require 'test_helper'

class GradingCheckTest < ActiveSupport::TestCase
  def setup
    @course = create(:course)
    @section = create(:section, course: @course)
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @reg = create(:registration, exam_version: @version)
    @grader = create(:user)
    @staff_reg = create(:staff_registration, user: @grader, section: @section)
    @check = create(:grading_check, creator: @grader, registration: @reg)
  end

  test 'grading check factory' do
    assert @check.valid?
  end

  test 'grading check with zero deduction is valid' do
    assert build(:grading_check, deduction: 0).valid?
  end

  test 'grading check with negative deduction is invalid' do
    assert_not build(:grading_check, deduction: -5).valid?
  end

  test 'invalid qnum' do
    bad = build(:grading_check, qnum: @version.questions.length)
    assert_not bad.valid?
    assert_match(/valid question/, bad.errors.full_messages.to_sentence)
  end
end
