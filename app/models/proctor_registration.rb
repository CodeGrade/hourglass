# frozen_string_literal: true

# Registrations for proctors to an exam.
class ProctorRegistration < ApplicationRecord
  belongs_to :user
  belongs_to :room

  validates :user, presence: true
  validates :room, presence: true

  delegate :exam, to: :room
  delegate :course, to: :exam
end
