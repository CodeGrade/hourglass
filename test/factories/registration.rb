# frozen_string_literal: true

FactoryBot.define do
  factory :registration do
    transient do
      exam { create(:exam) }
    end

    user
    room { create(:room, exam: exam) }
    exam_version { create(:exam_version, exam: exam) }

    trait :early_start do
      start_time { accommodated_start_time }
    end

    trait :normal_start do
      start_time { accommodated_start_time + (accommodated_duration / 4.0) }
    end

    trait :late_start do
      start_time { accommodated_end_time - (accommodated_duration / 4.0) }
    end
  end
end
