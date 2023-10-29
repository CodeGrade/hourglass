# frozen_string_literal: true

# Locks a particular (qnum, pnum) pair in a registration for grading.
class GradingLock < ApplicationRecord
  belongs_to :registration
  belongs_to :question
  belongs_to :part
  belongs_to :grader, class_name: 'User', optional: true
  belongs_to :completed_by, class_name: 'User', optional: true

  # NOTE: The :bulk_create context is used only in exam#initialize_grading_locks!
  # where this uniqueness property is already guaranteed
  validates :part, uniqueness: {
    scope: [:registration_id, :question],
    message: 'is already being graded',
  }, unless: -> { validation_context == :bulk_create }

  validate :valid_qp

  def valid_qp
    if (question && question.exam_version != exam_version) ||
       (part && part.question != question)

      errors.add(:base, 'Question and part must be self-consistent for the exam version.')
    end
  end

  delegate :exam_version, to: :registration
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
