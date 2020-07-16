# frozen_string_literal: true

require 'test_helper'

class GradingCommentTest < ActiveSupport::TestCase
  def setup
    @comment = create(:grading_comment)
  end

  test 'grading comment factory' do
    assert @comment.valid?
  end

  test 'grading comment with empty message is invalid' do
    assert_not build(:grading_comment, message: '').valid?
  end

  test 'grading comment with zero deduction is valid' do
    assert build(:grading_comment, deduction: 0).valid?
  end
end
