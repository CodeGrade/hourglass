# frozen_string_literal: true

FactoryBot.define do
  factory :grading_check do
    transient do
      staff_registration { create(:staff_registration) }
    end

    registration
    creator { staff_registration.user }

    question { registration.exam_version.db_questions.find_by(index: 0) }
    part { question.parts.find_by(index: 0) }
    body_item { part.body_items.find_by(index: 0) }
  end
end
