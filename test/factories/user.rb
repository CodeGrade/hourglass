# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    username { 'johndoe' }
    display_name { 'John Doe' }
    email { "#{username}@localhost.localdomain" }

    trait :admin do
      admin { true }
      display_name { 'Admin' }
    end
  end
end
