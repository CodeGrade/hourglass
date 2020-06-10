# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    transient do
      sequence :num
    end

    username { "user#{num}" }
    display_name { "User ##{num}" }
    email { "#{username}@localhost.localdomain" }

    factory :admin do
      admin { true }
      display_name { 'Admin' }
    end
  end
end
