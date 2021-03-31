# frozen_string_literal: true

require 'test_helper'

class QuestionTest < ActiveSupport::TestCase
  test 'factory builds valid question' do
    assert build(:student_question).valid?
  end
end
