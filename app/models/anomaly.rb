# frozen_string_literal: true

# Anomalies for student registrations.
class Anomaly < ApplicationRecord
  belongs_to :registration

  after_create :trigger_subscription

  validates :registration, presence: true

  delegate :user, to: :registration
  delegate :exam, to: :registration

  def trigger_subscription
    exam_id = HourglassSchema.id_from_object(exam, Types::ExamType, {})
    HourglassSchema.subscriptions.trigger(:anomaly_was_created, { exam_id: exam_id }, self)
  end

  def visible_to?(check_user)
    exam.proctors_and_professors.exists? check_user.id
  end
end
