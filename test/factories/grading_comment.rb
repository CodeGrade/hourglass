# frozen_string_literal: true

FactoryBot.define do
  factory :grading_comment do
    transient do
      staff_registration { create(:staff_registration) }
    end

    registration
    creator { staff_registration.user }

    message { 'You answered incorrectly.' }

    deduction { 10 }

    qnum { 0 }
    pnum { 0 }
    bnum { 0 }
  end
end
