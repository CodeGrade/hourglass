# frozen_string_literal: true

FactoryBot.define do
  factory :registration do
    transient do
      exam { create(:exam) }
    end

    user
    room { create(:room, exam: exam) }
    exam_version { create(:exam_version, exam: exam) }
  end
end
