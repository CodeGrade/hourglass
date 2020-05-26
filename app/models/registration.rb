# frozen_string_literal: true

# Room registrations for exam-taking students.
class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :room

  has_many :anomalies, dependent: :destroy
  has_many :snapshots, dependent: :destroy

  validates :user, presence: true
  validates :room, presence: true

  delegate :exam, to: :room

  def visible_to?(other_user)
    # TODO if other user is a prof for the course or an admin
    other_user == user
  end

  def anomalous?
    anomalies.size.positive?
  end

  def allow_submission?
    !(final? || anomalous?)
  end

  def current_answers
    snapshots.last&.answers || {}
  end

  def save_answers(answers)
    # TODO move to snapshots#create
    json = current_answers
    return if json == answers

    Snapshot.create!(
      registration: self,
      answers: answers
    )
  end
end
