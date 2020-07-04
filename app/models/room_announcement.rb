# frozen_string_literal: true

# An announcement sent during an exam to a room.
class RoomAnnouncement < ApplicationRecord
  belongs_to :room

  validates :room, presence: true
  validates :body, presence: true

  delegate :exam, to: :room

  after_create :trigger_subscription

  def trigger_subscription
    HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: exam.id }, exam)
  end

  def serialize
    {
      id: id,
      body: body,
      time: created_at,
      type: 'room',
    }
  end
end
