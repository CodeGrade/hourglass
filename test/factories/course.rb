# frozen_string_literal: true

FactoryBot.define do
  factory :course do
    title { 'CS 2500' }
    last_sync { '2020-05-22 14:03:53' }
    active { true }
    sequence(:bottlenose_id)
  end
end
