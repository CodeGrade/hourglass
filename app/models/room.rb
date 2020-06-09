class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations, dependent: :destroy
  has_many :proctor_registrations, dependent: :destroy
  has_many :room_announcements, dependent: :destroy

  validates :exam, presence: true
  validates :name, presence: true

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    registrations.update_all(final: true)
  end
end
