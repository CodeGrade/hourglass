# frozen_string_literal: true

FactoryBot.define do
  factory :grading_lock do
    transient do
      staff_registration { create(:staff_registration) }
    end

    registration
    grader { staff_registration.user }

    question { registration.exam_version.db_questions.find_by(index: 0) }
    part { question.parts.find_by(index: 0) }
  end
end
