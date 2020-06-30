# frozen_string_literal: true

FactoryBot.define do
  factory :grading_lock do
    transient do
      staff_registration { create(:staff_registration) }
    end

    registration
    grader { staff_registration.user }

    qnum { 0 }
    pnum { 0 }
  end
end
