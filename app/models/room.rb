class Room < ApplicationRecord
  belongs_to :exam
  has_many :registrations

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    registrations.update_all(final: true)
  end
end
