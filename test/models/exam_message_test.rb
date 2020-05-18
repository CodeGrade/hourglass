# frozen_string_literal: true

require 'test_helper'

class ExamMessageTest < ActiveSupport::TestCase
  test 'should save valid message' do
    em = ExamMessage.new(
      sender: users(:ben),
      exam: exams(:cs2500midterm),
      body: 'This is a valid message'
    )
    assert em.save
  end

  test 'should not save message without body' do
    em = ExamMessage.new(
      sender: users(:ben),
      exam: exams(:cs2500midterm)
    )
    assert_not em.save
  end

  test 'should not save message without sender' do
    em = ExamMessage.new(
      exam: exams(:cs2500midterm),
      recipient: users(:kyle),
      body: 'Bad message'
    )
    assert_not em.save
  end

  test 'students can send question' do
    em = ExamMessage.new(
      exam: exams(:cs2500midterm),
      sender: users(:kyle),
      body: 'I have a question. Can I ask it?'
    )
    assert em.save
  end

  test 'professors can send announcements' do
    em = ExamMessage.new(
      exam: exams(:cs2500midterm),
      sender: users(:ben),
      body: 'No more questions.'
    )
    assert em.save
  end

  test 'students cannot send private messages' do
    em = ExamMessage.new(
      exam: exams(:cs2500midterm),
      recipient: users(:tyler),
      sender: users(:kyle),
      body: 'hi'
    )
    assert_not em.private_message_only_by_prof
    assert_not em.save
  end
end
