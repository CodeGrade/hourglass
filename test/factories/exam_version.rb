# frozen_string_literal: true

FactoryBot.define do
  factory :exam_version do
    cs2500_v1

    before(:create) do |ev, context|
      context.upload.build_exam_version(context.name, ev)
    end

    trait :blank do
      name { 'Blank exam' }
      transient do
        upload { association(:upload, :blank) }
      end
      before(:create) do |ev, _context|
        ev.db_questions.each do |q|
          q.exam_version = nil
          q.parts.each do |p|
            p.question = nil
            p.body_items.each do |b|
              b.part = nil
            end
            p.body_items.delete_all
          end
          q.parts.delete_all
        end
        ev.db_questions.delete_all
      end
    end

    trait :cs2500_v1 do
      name { 'CS2500 Midterm Version 1' }
      transient do
        upload { association(:upload, :cs2500_v1) }
      end
    end

    trait :with_lockdown do
      cs2500_v2
    end

    trait :cs2500_v2 do
      name { 'CS2500 Midterm Version 2' }
      transient do
        upload { association(:upload, :cs2500_v2) }
      end
    end

    trait :cs3500_v1 do
      name { 'CS3500 Final Version 1' }
      transient do
        upload { association(:upload, :cs3500_v1) }
      end
    end

    trait :cs3500_v2 do
      name { 'CS3500 Final Version 2' }
      transient do
        upload { association(:upload, :cs3500_v2) }
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
