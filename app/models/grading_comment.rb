# frozen_string_literal: true

# A grading comment that contains a message for the student.
class GradingComment < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  belongs_to :registration

  delegate :exam_version, to: :registration

  validates :creator, presence: true
  validates :registration, presence: true
  validates :message, presence: true

  validates :deduction, presence: true, numericality: {
    greater_than_or_equal_to: 0,
  }

  validates :qnum, presence: true
  validates :pnum, presence: true
  validates :bnum, presence: true

  validate :valid_qpb

  def valid_qpb
    return if exam_version.questions.dig(qnum, 'parts', pnum, 'body', bnum)

    errors.add(:base, 'must have valid question, part, and body item numbers')
  end
end
