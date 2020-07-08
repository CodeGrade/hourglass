# frozen_string_literal: true

FactoryBot.define do
  factory :student_registration do
    transient do
      course { create(:course) }
    end

    user
    section { create(:section, course: course) }
  end
end
