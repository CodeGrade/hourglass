# frozen_string_literal: true

FactoryBot.define do
  factory :student_question do
    registration
    body { 'Am I allowed to use toBinaryString?' }
  end
end
