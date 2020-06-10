# frozen_string_literal: true

FactoryBot.define do
  factory :proctor_registration do
    transient do
      exam { build(:exam) }
    end

    user
    room { create(:room, exam: exam) }
  end
end
