# frozen_string_literal: true

FactoryBot.define do
  factory :exam_announcement do
    exam
    body { "Hello all students. You are taking #{exam.name}." }
  end
end
