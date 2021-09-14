# frozen_string_literal: true

FactoryBot.define do
  factory :term do
    sequence(:year, 2000)
    semester { Term.semesters.values.sample }
  end
end
