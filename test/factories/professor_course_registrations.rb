# frozen_string_literal: true

FactoryBot.define do
  factory :professor_course_registration do
    course
    user
  end
end
