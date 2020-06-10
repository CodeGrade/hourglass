# frozen_string_literal: true

FactoryBot.define do
  factory :section do
    lecture
    course
    sequence(:bottlenose_id)

    trait :lecture do
      title { 'Lecture (TF 11:45-1:25)' }
    end

    trait :lab do
      title { 'Lab (F 1:25-3:15)' }
    end
  end
end
