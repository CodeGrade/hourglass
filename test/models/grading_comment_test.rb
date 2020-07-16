# frozen_string_literal: true

require 'test_helper'

class GradingCommentTest < ActiveSupport::TestCase
  def setup
    @course = create(:course)
    @section = create(:section, course: @course)
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @reg = create(:registration, exam_version: @version)
    @grader = create(:user)
    @staff_reg = create(:staff_registration, user: @grader, section: @section)
    @comment = create(:grading_comment, creator: @grader, registration: @reg)
  end

  test 'grading comment factory' do
    assert @comment.valid?
  end

  test 'grading comment with empty message is invalid' do
    assert_not build(:grading_comment, message: '').valid?
  end

  test 'grading comment with zero points is valid' do
    assert build(:grading_comment, points: 0).valid?
  end

  test 'grading comment with deduction is valid' do
    assert build(:grading_comment, points: -5).valid?
  end

  test 'grading comment with bonus is valid' do
    assert build(:grading_comment, points: 5).valid?
  end

  test 'invalid qnum' do
    bad = build(:grading_check, qnum: @version.questions.length)
    assert_not bad.valid?
    assert_match(/item numbers must be valid/, bad.errors.full_messages.to_sentence)
  end
end
