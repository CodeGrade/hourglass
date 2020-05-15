class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :exam
  belongs_to :room

  has_many :anomalies
  has_many :snapshots

  # student takes exams
  # grader just grades
  # proctor can fix anomalies and finalize exams
  enum role: [:student, :grader, :proctor, :professor]

  def visible_to?(user)
    reg = Registration.find_by(user: user, exam: exam)
    return true if Registration::roles[reg.role] > Registration::roles[:grader]

    self.user == user
  end

  def anomalous?
    anomalies.size.positive?
  end

  def allow_submission?
    !(final? || anomalous?)
  end

  def get_all_answers
    snapshots.map(&:answers)
  end

  def get_current_answers
    snapshots.last&.answers || {}
  end

  def save_answers(answers)
    json = get_current_answers
    return if json == answers

    Snapshot.create!(
      registration: self,
      answers: answers
    )
  end
end
