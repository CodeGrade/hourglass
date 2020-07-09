# frozen_string_literal: true

require 'test_helper'

class MessageTest < ActiveSupport::TestCase
  test 'factory creates valid messages' do
    msg = build(:message)
    assert msg.valid?
    assert msg.save
    assert msg.sender.sent_messages.include? msg
    assert msg.registration.messages.include? msg
  end

  test 'should not save message without sender' do
    msg = build(:message, sender: nil)
    assert_not msg.save
    assert_match(/Sender must exist/, msg.errors.full_messages.to_sentence)
  end

  test 'students cannot send messages to other students' do
    exam = build(:exam)
    ev = build(:exam_version, exam: exam)
    reg = build(:registration, exam_version: ev)
    reg2 = build(:registration, exam_version: ev)
    msg = build(
      :message,
      {
        sender: reg.user,
        registration: reg2,
        body: 'hi',
      }
    )
    assert_not msg.valid?
    assert_match(/must be a proctor or professor/, msg.errors[:sender].first)
    assert_not msg.save
  end
end
