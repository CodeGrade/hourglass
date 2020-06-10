# frozen_string_literal: true

FactoryBot.define do
  factory :accommodation do
    registration
    new_start_time { registration.exam.start_time }
    percent_time_expansion { 0 }
  end
end
