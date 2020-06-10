# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    transient do
      prof_reg { create(:professor_course_registration) }
    end

    sender { prof_reg.user }
    association :recipient, factory: :user
    exam { create(:exam, course: prof_reg.course) }
    body { 'Read the directions for that question more carefully..' }
  end
end
