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
  validates :bnum, presence: true

  validate :valid_qpb

  def valid_qpb
    return if exam_version.questions.dig(qnum, 'parts', pnum, 'body', bnum)

    errors.add(:base, 'Question, part, and body item numbers must be valid for the exam version.')
  end

  def correct?
    deduction.nil?
  end
end
