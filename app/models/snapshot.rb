# frozen_string_literal: true

# Mapping from timestamp to student's current answers.
class Snapshot < ApplicationRecord
  belongs_to :registration

  delegate :user, to: :registration
  delegate :exam, to: :registration

  validates :answers, presence: true

  scope :most_recent_by_registration, lambda {
    from(
      <<~SQL.squish,
        (
          SELECT snapshots.*
          FROM snapshots JOIN (
             SELECT registration_id, max(created_at) AS created_at
             FROM snapshots
             GROUP BY registration_id
          ) latest_by_registration
          ON snapshots.created_at = latest_by_registration.created_at
          AND snapshots.registration_id = latest_by_registration.registration_id
        ) snapshots
      SQL
    )
  }
end
