# frozen_string_literal: true

# Locks a particular (qnum, pnum) pair in a registration for grading.
class GradingLock < ApplicationRecord
  belongs_to :registration
  belongs_to :grader, class_name: 'User', optional: true

  validates :registration, presence: true

  validates :pnum, uniqueness: {
    scope: [:registration_id, :qnum],
    message: 'is already being graded',
  }

  scope :incomplete, -> { where(completed: false) }
  scope :complete, -> { where(completed: true) }
  scope :no_grader, -> { where(grader: nil) }
end
