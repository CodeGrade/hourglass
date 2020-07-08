# frozen_string_literal: true

FactoryBot.define do
  factory :proctor_registration do
    user
    exam
  end
end
