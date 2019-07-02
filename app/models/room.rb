class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations

  def finalized?
    registrations.all?(&:final)
  end
end
