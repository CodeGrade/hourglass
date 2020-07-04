# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    registration
    body { 'Am I allowed to use toBinaryString?' }
  end
end
