# frozen_string_literal: true

# Anomalies for student registrations.
class Anomaly < ApplicationRecord
  belongs_to :registration

  after_create :trigger_subscription

  validates :registration, presence: true

  delegate :user, to: :registration
  delegate :exam, to: :registration

  def trigger_subscription
    HourglassSchema.subscriptions.trigger(:anomaly_was_created, { exam_rails_id: exam.id }, self)
  end
end
