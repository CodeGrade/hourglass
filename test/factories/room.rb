# frozen_string_literal: true

FactoryBot.define do
  factory :room do
    transient do
      sequence(:room_number, 200)
    end

    exam
    name { "Richards #{room_number}" }
  end
end
