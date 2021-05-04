# frozen_string_literal: true

FactoryBot.define do
  factory :exam_version do
    cs2500_v1

    before(:create) do |ev, context|
      context.upload.build_exam_version(context.name, ev)
    end

    trait :cs2500_v1 do
      name { 'CS2500 Midterm Version 1' }
      transient do
        upload { create(:upload, :cs2500_v1) }
      end
    end

    trait :with_lockdown do
      cs2500_v2
    end

    trait :cs2500_v2 do
      name { 'CS2500 Midterm Version 2' }
      transient do
        upload { create(:upload, :cs2500_v2) }
      end
    end

    trait :cs3500_v1 do
      name { 'CS3500 Final Version 1' }
      transient do
        upload { create(:upload, :cs3500_v1) }
      end
    end

    trait :cs3500_v2 do
      name { 'CS3500 Final Version 2' }
      transient do
        upload { create(:upload, :cs3500_v2) }
      end
    end

    trait :with_finished_submissions do
      transient do
        submissions_count { 5 }
      end
      after(:create) do |ev, context|
        create_list(:registration, context.submissions_count, :done, exam_version: ev)
      end
    end

    trait :with_started_submissions do
      transient do
        submissions_count { 5 }
      end
      after(:create) do |ev, context|
        create_list(:registration, context.submissions_count, :early_start, exam_version: ev)
      end
    end

    exam
  end
end
