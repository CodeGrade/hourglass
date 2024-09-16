# frozen_string_literal: true

# Anomalies for student registrations.
class Anomaly < ApplicationRecord
  belongs_to :registration

  after_create :trigger_subscription

  has_one :user, through: :registration
  has_one :exam, through: :registration
  has_one :exam_version, through: :registration

  def user
    super || registration.try(:user)
  end

  def exam
    super || registration.try(:exam)
  end

  def exam_version
    super || registration.try(:exam_version)
  end

  scope :unforgiven, -> { where(forgiven: false) }
  scope :forgiven, -> { where(forgiven: true) }

  def trigger_subscription
    exam_id = HourglassSchema.id_from_object(exam, Types::ExamType, {})
    HourglassSchema.subscriptions.trigger(:anomaly_was_created, { exam_id: }, self)
  end

  def visible_to?(check_user, role_for_exam, _role_for_course)
    (role_for_exam >= Exam.roles[:proctor]) || exam.proctors_and_professors.exists?(check_user.id)
  end

  def prior_anomaly_count
    registration.anomalies.count - 1
  end
end
