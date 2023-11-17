# frozen_string_literal: true

FactoryBot.define do
  factory :snapshot do
    registration
    answers { registration.exam_version.default_answers }

    trait :long_answers do
      answers do
        JSON.parse(Rails.root.join('test/fixtures/files/long-snapshot.json').read)
      end
    end
  end
end
