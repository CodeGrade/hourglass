# frozen_string_literal: true

# Registrations for professors to a course.
class ProctorRegistration < ApplicationRecord
  belongs_to :user
  belongs_to :room

  validates :user, presence: true
  validates :room, presence: true

  delegate :exam, to: :room
end
