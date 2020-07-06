# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    transient do
      exam { create(:exam) }
      prof_reg { create(:professor_course_registration, course: exam.course) }
    end

    sender { prof_reg.user }
    registration { create(:registration, exam: exam) }
    body { 'Read the directions for that question more carefully..' }
  end
end
