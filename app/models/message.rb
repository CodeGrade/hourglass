# frozen_string_literal: true

# A message sent from a professor to a student during an exam.
class Message < ApplicationRecord
  belongs_to :exam
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User'

  validates :sender, presence: true
  validates :recipient, presence: true
  validates :body, presence: true

  validate :sent_by_prof

  def sent_by_prof
    return if exam.course.professors.include? sender

    errors.add(:sender, 'must be a professor')
  end

  after_create :trigger_subscription

  def trigger_subscription
    HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: exam.id }, exam)
  end

  def serialize
    {
      id: id,
      body: body,
      time: created_at,
      type: 'personal',
    }
  end
end
