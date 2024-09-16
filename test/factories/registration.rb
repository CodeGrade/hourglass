# frozen_string_literal: true

FactoryBot.define do
  factory :registration do
    transient do
      # rubocop:disable FactoryBot/FactoryAssociationWithStrategy
      # need registration to be fully saved so that the user has an id,
      # for validation purposes later on
      student_registration { create(:student_registration, course: exam_version.course) }
      # rubocop:enable FactoryBot/FactoryAssociationWithStrategy
    end

    user { student_registration.user }
    exam_version

    # Student starts at the start of their window
    trait :early_start do
      start_time { accommodated_start_time }
    end

    # Student starts 1/8 of the way into their window
    trait :normal_start do
      start_time { accommodated_start_time + (accommodated_duration / 8.0) }
    end

    # Student starts with 1/4 of their time remaining in their window
    trait :late_start do
      start_time { accommodated_end_time - (accommodated_duration / 4.0) }
    end

    trait :done do
      early_start
      end_time { start_time + effective_duration }
    end
  end
end
