# frozen_string_literal: true

FactoryBot.define do
  factory :grading_comment do
    transient do
      staff_registration { association(:staff_registration) }
    end

    registration
    creator { staff_registration.user }

    message { 'You answered incorrectly.' }

    points { 10 }

    question { registration.exam_version.db_questions.find_by(index: 0) }
    part { question.parts.find_by(index: 0) }
    body_item { part.body_items.find_by(index: 0) }
  end
end
