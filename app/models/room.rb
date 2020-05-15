class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations

  validates_presence_of :name

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    registrations.update_all(final: true)
  end
end
