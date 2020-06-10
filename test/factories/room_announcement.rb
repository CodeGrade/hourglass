# frozen_string_literal: true

FactoryBot.define do
  factory :room_announcement do
    room
    body { "Hello, all students in #{room.name}!" }
  end
end
