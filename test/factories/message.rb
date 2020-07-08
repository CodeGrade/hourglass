# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    transient do
      prof_reg { create(:professor_course_registration, course: registration.exam.course) }
    end

    sender { prof_reg.user }
    registration
    body { 'Read the directions for that question more carefully..' }
  end
end
