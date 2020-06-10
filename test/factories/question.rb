# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    transient do
      reg { build(:registration) }
    end

    exam { reg.exam }
    sender { reg.user }
    body { 'Am I allowed to use toBinaryString?' }
  end
end
