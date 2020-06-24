class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations, dependent: :destroy
  has_many :proctor_registrations, dependent: :destroy
  has_many :room_announcements, dependent: :destroy

  validates :exam, presence: true
  validates :name, presence: true

  def finalized?
    registrations.all?(&:final?)
  end

  def finalize!
    registrations.each(&:finalize!)
  end

  def has_staff?
    proctor_registrations.length.positive?
  end

  def has_registrations?
    registrations.length.positive?
  end

  def has_users?
    has_staff? || has_registrations?
  end
end
