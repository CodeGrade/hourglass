# frozen_string_literal: true

class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations, dependent: :restrict_with_error
  has_many :proctor_registrations, dependent: :restrict_with_error
  has_many :room_announcements, dependent: :destroy

  validates :exam, presence: true
  validates :name, presence: true

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
end
