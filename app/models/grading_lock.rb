# frozen_string_literal: true

# Locks a particular (qnum, pnum) pair in a registration for grading.
class GradingLock < ApplicationRecord
  belongs_to :registration
  belongs_to :grader, class_name: 'User', optional: true
  belongs_to :completed_by, class_name: 'User', optional: true

  validates :registration, presence: true

  validates :pnum, uniqueness: {
    scope: [:registration_id, :qnum],
    message: 'is already being graded',
  }

  delegate :exam, to: :registration

  scope :incomplete, -> { where(completed_by: nil) }
  scope :complete, -> { where.not(completed_by: nil) }
  scope :no_grader, -> { where(grader: nil) }

  def visible_to?(check_user)
    (grader == check_user) || (completed_by == check_user) || exam.professors.exists?(check_user.id)
  end
end
