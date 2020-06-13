# frozen_string_literal: true

FactoryBot.define do
  factory :exam_version do
    cs2500_v1

    trait :cs2500_v1 do
      name { 'CS2500 Midterm Version 1' }
      transient do
        upload { create(:upload, :cs2500_v1) }
      end
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

    exam
    files { upload.files }
    info { upload.info }
  end
end
