# frozen_string_literal: true

FactoryBot.define do
  factory :version_announcement do
    exam_version
    body { "Hello all students, welcome to #{exam_version.exam.name}!" }
  end
end
