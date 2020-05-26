# frozen_string_literal: true

require 'test_helper'

class MessageTest < ActiveSupport::TestCase
  test 'should not save message without sender' do
    msg = Message.new(
      exam: exams(:cs2500midterm),
      recipient: users(:cs2500student),
      body: 'Bad message'
    )
    assert_not msg.save
  end

  test 'students cannot send messages to other students' do
    msg = Message.new(
      exam: exams(:cs2500midterm),
      sender: users(:cs2500student),
      recipient: users(:cs3500student),
      body: 'hi'
    )
    assert_not msg.valid?
    assert_not msg.save
  end
end
