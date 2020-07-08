# frozen_string_literal: true

# Registrations for proctors to an exam, and optional room.
class ProctorRegistration < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  belongs_to :room, optional: true

  validates :user, presence: true
  validates :exam, presence: true
  validate :room_in_exam

  delegate :course, to: :exam

  def room_in_exam
    return unless room

    return if room.exam == exam

    errors.add(:room, 'needs to be part of the correct exam')
  end

  def visible_to?(check_user)
    course.professors.or(User.where(id: user.id)).exists? check_user.id
  end
end
