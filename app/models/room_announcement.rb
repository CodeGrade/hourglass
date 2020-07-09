# frozen_string_literal: true

# An announcement sent during an exam to a room.
class RoomAnnouncement < ApplicationRecord
  belongs_to :room

  validates :room, presence: true
  validates :body, presence: true

  delegate :exam, to: :room
  delegate :visible_to?, to: :room
end
