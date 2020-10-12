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

  def visible_to?(check_user, role_for_exam, _role_for_course)
    (check_user && grader_id == check_user.id) ||
      (check_user && completed_by_id == check_user.id) ||
      (role_for_exam >= Exam.roles[:professor]) ||
      exam.professors.exists?(check_user.id)
  end
end
