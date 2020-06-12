# frozen_string_literal: true

FactoryBot.define do
  factory :exam do
    course
    name { 'CS2500 Midterm' }
    duration { 30.minutes }
    start_time { DateTime.now }
    end_time { DateTime.now + 3.hours }

    trait :with_finished_submissions do
      transient do
        submissions_count { 5 }
      end
      after(:create) do |exam, context|
        create_list(:registration, context.submissions_count, :done, exam: exam)
      end
    end

    trait :with_started_submissions do
      transient do
        submissions_count { 5 }
      end
      after(:create) do |exam, context|
        create_list(:registration, context.submissions_count, :early_start, exam: exam)
      end
    end
  end
end
