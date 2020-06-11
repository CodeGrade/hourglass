# frozen_string_literal: true

FactoryBot.define do
  factory :exam do
    course
    name { 'CS2500 Midterm' }
    duration { 30.minutes }
    start_time { DateTime.now }
    end_time { DateTime.now + 3.hours }
  end
end
