# frozen_string_literal: true

# An announcement sent during an exam to a room.
class RoomAnnouncement < ApplicationRecord
  belongs_to :room

  validates :body, presence: true

  has_one :exam, through: :room
  delegate :visible_to?, to: :room

  def exam
    super || room.try(:exam)
  end
end
