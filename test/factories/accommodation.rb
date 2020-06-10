# frozen_string_literal: true

FactoryBot.define do
  factory :accommodation do
    registration
    new_start_time { registration.exam.start_time - 1.hour }
    sequence(:percent_time_expansion, (1..100).cycle)
  end
end
