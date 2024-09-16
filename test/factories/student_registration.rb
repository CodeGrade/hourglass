# frozen_string_literal: true

FactoryBot.define do
  factory :student_registration do
    transient do
      course { association(:course) }
    end

    user
    section { association(:section, course:) }
  end
end
