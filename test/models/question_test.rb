# frozen_string_literal: true

require 'test_helper'

class QuestionTest < ActiveSupport::TestCase
  test 'students can send question' do
    q = Question.new(
      exam: exams(:cs2500midterm),
      sender: users(:cs2500student),
      body: 'I have a question. Can I ask it?'
    )
    assert q.save
  end
end
