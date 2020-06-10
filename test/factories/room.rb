# frozen_string_literal: true

FactoryBot.define do
  factory :room do
    exam
    name { 'Richards 201' }
  end
end
