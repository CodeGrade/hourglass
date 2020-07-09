# frozen_string_literal: true

# Questions from students during an exam.
class Question < ApplicationRecord
  belongs_to :registration

  delegate :exam, to: :registration

  validates :registration, presence: true
  validates :body, presence: true

  after_create :trigger_subscription

  def trigger_subscription
    # TODO: move this to question mutation
    HourglassSchema.subscriptions.trigger(:message_was_sent, {
      exam_id: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    }, exam)
  end

  def serialize
    {
      body: body,
      time: created_at,
      id: id,
    }
  end
end
