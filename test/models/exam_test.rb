require 'test_helper'

class ExamTest < ActiveSupport::TestCase
  test 'exam factory builds valid exam' do
    assert build(:exam).valid?
  end
end
