# frozen_string_literal: true

require 'test_helper'

class ExamVersionTest < ActiveSupport::TestCase
  test 'cs2500 midterm v1 is valid' do
    assert exam_versions(:cs2500midterm_1).valid?
  end

  test 'cs2500 midterm v2 is valid' do
    assert exam_versions(:cs2500midterm_2).valid?
  end

  test 'cs3500 final v1 is valid' do
    assert exam_versions(:cs3500final_1).valid?
  end
end
