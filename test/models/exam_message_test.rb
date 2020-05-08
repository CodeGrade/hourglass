# frozen_string_literal: true

require 'test_helper'

class ExamMessageTest < ActiveSupport::TestCase
  test 'should save valid message' do
    em = ExamMessage.new(
      sender: users(:ben),
      exam: exams(:examOne),
      body: 'This is a valid message'
    )
    assert em.save
  end

  test 'should not save message without body' do
    em = ExamMessage.new(
      sender: users(:ben),
      exam: exams(:examOne)
    )
    assert_not em.save
  end

  test 'should not save message without sender' do
    em = ExamMessage.new(
      exam: exams(:examOne),
      recipient: users(:kyle),
      body: 'Bad message'
    )
    assert_not em.save
  end
end
