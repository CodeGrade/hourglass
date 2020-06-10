# frozen_string_literal: true

FactoryBot.define do
  factory :snapshot do
    registration
    answers { registration.exam_version.default_answers }
  end
end
