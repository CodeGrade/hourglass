# frozen_string_literal: true

# A room where students can take an exam
class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations, dependent: :restrict_with_error
  has_many :proctor_registrations, dependent: :restrict_with_error
  has_many :room_announcements, dependent: :destroy

  validates :exam, presence: true
  validates :name, presence: true

  delegate :professors, to: :exam
  delegate :proctors_and_professors, to: :exam

  def finalized?
    registrations.in_progress.empty?
  end

  def finalize!
    registrations.each(&:finalize!)
  end

  def has_staff?
    proctor_registrations.exists?
  end

  def has_registrations?
    registrations.exists?
  end

  def students
    User.where(id: registrations.select(:user_id))
  end

  def visible_to?(check_user)
    proctors_and_professors.or(students).exists? check_user.id
  end
end
