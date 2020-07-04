# frozen_string_literal: true

# Questions from students during an exam.
class Question < ApplicationRecord
  belongs_to :exam
  belongs_to :sender, class_name: 'User'

  validates :exam, presence: true
  validates :sender, presence: true
  validates :body, presence: true

  after_create :trigger_subscription

  def trigger_subscription
    HourglassSchema.subscriptions.trigger(:message_was_sent, { exam_rails_id: exam.id }, exam)
  end

  def serialize
    # TODO
    {
      body: body,
      time: created_at,
      id: id,
    }
  end
end
