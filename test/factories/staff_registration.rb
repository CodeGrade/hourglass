# frozen_string_literal: true

FactoryBot.define do
  factory :staff_registration do
    user
    section

    trait :ta do
      ta { true }
    end
  end
end
