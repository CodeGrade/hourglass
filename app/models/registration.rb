# frozen_string_literal: true

# Room registrations for exam-taking students.
class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :room
  belongs_to :exam_version

  has_many :anomalies, dependent: :destroy
  has_many :snapshots, dependent: :destroy

  validates :user, presence: true
  validates :room, presence: true
  validates :exam_version, presence: true
  validate :room_version_same_exam

  delegate :exam, to: :exam_version
  delegate :course, to: :exam

  def room_version_same_exam
    room.exam == exam_version.exam
  end

  def visible_to?(other_user)
    # TODO: if other user is a prof for the course or an admin
    other_user == user
  end

  def anomalous?
    anomalies.size.positive?
  end

  def final?
    !end_time.nil?
  end

  def allow_submission?
    !(final? || anomalous?)
  end

  def current_answers
    snapshots.last&.answers || exam.default_answers_for(self)
  end

  def timed_out?
    # TODO
    false
  end

  def save_answers(answers)
    return false unless allow_submission?

    if timed_out?
      update(end_time: DateTime.now)
      return false
    end

    json = current_answers
    return true if json == answers

    Snapshot.create(
      registration: self,
      answers: answers
    )
  end

  def my_questions
    exam.questions.where(sender: user)
  end

  def private_messages_for(user)
    exam.messages.where(recipient: user)
  end

  def all_messages_for(user)
    private_messages_for(user) +
      room.room_announcements +
      exam_version.version_announcements
  end
end
