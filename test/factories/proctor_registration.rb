# frozen_string_literal: true

FactoryBot.define do
  factory :proctor_registration do
    user
    exam

    trait :in_room do
      room { create(:room, exam: exam) }
    end
  end
end
