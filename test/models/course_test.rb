require 'test_helper'

class CourseTest < ActiveSupport::TestCase
  test 'course factory builds valid course' do
    assert build(:course).valid?
  end
end
