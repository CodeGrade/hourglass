# frozen_string_literal: true

# A grading comment that is either correct or incorrect (no extended message).
class GradingCheck < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  belongs_to :registration

  delegate :exam_version, to: :registration

  validates :creator, presence: true
  validates :registration, presence: true

  # negative - deduction
  # positive - bonus
  validates :points, numericality: {
    allow_nil: true,
  }

  validates :qnum, presence: true
  validates :pnum, presence: true
  validates :bnum, presence: true, uniqueness: {
    scope: [:registration, :qnum, :pnum],
    message: 'Grading check already exists on this body item.',
  }

  delegate :user, to: :registration
  delegate :course, to: :exam_version

  validate :valid_qpb

  def valid_qpb
    return if exam_version.questions.dig(qnum, 'parts', pnum, 'body', bnum)

    errors.add(:base, 'Question, part, and body item numbers must be valid for the exam version.')
  end

  def correct?
    deduction.nil?
  end

  def visible_to?(check_user)
    course.all_staff.or(User.where(id: user.id)).exists? check_user.id
  end
end
