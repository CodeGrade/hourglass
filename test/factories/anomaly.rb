# frozen_string_literal: true

FactoryBot.define do
  factory :anomaly do
    registration
    reason { 'Left fullscreen.' }
  end
end
