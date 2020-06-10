# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    username { 'johndoe' }
    display_name { 'John Doe' }
    email { "#{username}@localhost.localdomain" }

    factory :admin do
      admin { true }
    end
  end
end
