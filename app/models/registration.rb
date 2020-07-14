# frozen_string_literal: true

# Room registrations for exam-taking students.
class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :room, optional: true
  belongs_to :exam_version

  has_many :anomalies, dependent: :destroy
  has_many :snapshots, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_one :accommodation, dependent: :destroy

  validates :user, presence: true
  validates :exam_version, presence: true
  validate :room_version_same_exam
  validate :user_in_course

  delegate :exam, to: :exam_version
  delegate :proctors_and_professors, to: :exam
  delegate :course, to: :exam

  def room_version_same_exam
    return unless room

    return if room.exam == exam_version.exam

    errors.add(:room, 'needs to be part of the correct exam')
  end

  def user_in_course
    return if course.students.include? user

    errors.add(:user, 'needs to be registered for the course')
  end

  scope :without_accommodation, -> { includes(:accommodation).where(accommodations: { id: nil }) }

  # TIMELINE EXPLANATION
  #
  # EXAM OVERALL:
  # |                    +---------+                       |
  # exam start           duration                      exam end
  # my accommodation: new start?, time factor
  # MY EXAM EXPERIENCE:
  # |                   +----------------+                         |
  # my exam start     my start         my end                  my exam end
  # my-exam-start == new-start ?? exam-start
  # my-duration = duration * time-factor
  # my-exam-end == my-exam-start + (exam-end - exam-start) + (my-duration - duration)
  # my-start >= my-exam-start
  # my-end <= my-exam-end
  # my-end <= my-start + my-duration

  def accommodated_start_time
    accommodation&.new_start_time || exam.start_time
  end

  def accommodated_duration
    exam.duration * (accommodation&.factor || 1)
  end

  def accommodated_extra_duration
    accommodated_duration - exam.duration
  end

  def accommodated_end_time
    exam.end_time + accommodated_extra_duration
  end

  # End time plus any applicable extensions
  def effective_end_time
    if start_time.nil?
      accommodated_end_time
    else
      [start_time + accommodated_duration, accommodated_end_time].min
    end
  end

  # duration plus any applicable extensions
  def effective_duration
    if start_time.nil?
      accommodated_duration
    else
      effective_end_time - start_time
    end
  end

  scope :not_started, -> { where(start_time: nil) }
  scope :started, -> { where.not(start_time: nil) }

  def started?
    !start_time.nil?
  end

  def over?
    DateTime.now > effective_end_time
  end

  def anomalous?
    anomalies.unforgiven.size.positive?
  end

  scope :in_progress, -> { where(end_time: nil) }
  scope :final, -> { where.not(end_time: nil) }
  
  def final?
    !end_time.nil?
  end

  def finalize!
    update!(end_time: DateTime.now)
  end

  def current_answers
    snapshots.last&.answers || exam_version.default_answers
  end

  def save_answers(answers)
    return false if final? || anomalous? || over?

    json = current_answers
    return true if json == answers

    Snapshot.create(registration: self, answers: answers)
  end

  def my_questions
    questions
  end

  def private_messages
    messages
  end

  def visible_to?(check_user)
    proctors_and_professors.or(User.where(id: user.id)).exists? check_user.id
  end
end
