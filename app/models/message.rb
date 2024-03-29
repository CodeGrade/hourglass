# frozen_string_literal: true

# A message sent from a professor to a student during an exam.
class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :registration

  validates :body, presence: true, length: { maximum: 2000 }

  has_one :user, through: :registration
  has_one :exam, through: :registration
  delegate :proctors_and_professors, to: :exam
  delegate :visible_to?, to: :registration

  def user
    super || registration.try(:user)
  end

  def exam
    super || registration.try(:exam)
  end

  validate :sent_by_proctor, if: :sender

  def sent_by_proctor
    return if exam.proctors_and_professors.exists? sender.id

    errors.add(:sender, 'must be a proctor or professor')
  end
end
