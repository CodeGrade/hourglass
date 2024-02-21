# frozen_string_literal: true

# Registrations for proctors to an exam, and optional room.
class ProctorRegistration < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  belongs_to :room, optional: true

  validate :room_in_exam

  has_one :course, through: :exam
  delegate :professors, to: :exam

  def course
    super || exam.try(:course)
  end

  def room_in_exam
    return unless room

    return if room.exam == exam

    errors.add(:room, 'needs to be part of the correct exam')
  end

  def visible_to?(check_user, role_for_exam, _role_for_course)
    ((user_id || user&.id) == check_user.id) ||
      (role_for_exam >= Exam.roles[:professor]) ||
      professors.exists?(check_user.id)
  end
end
