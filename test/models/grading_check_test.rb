# frozen_string_literal: true

require 'test_helper'

class GradingCheckTest < ActiveSupport::TestCase
  def setup
    @check = create(:grading_check)
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
end
