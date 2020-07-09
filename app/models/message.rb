# frozen_string_literal: true

# A message sent from a professor to a student during an exam.
class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :registration

  validates :sender, presence: true
  validates :registration, presence: true
  validates :body, presence: true, length: { maximum: 2000 }

  delegate :user, to: :registration
  delegate :exam, to: :registration
  delegate :proctors_and_professors, to: :exam
  delegate :visible_to?, to: :registration

  validate :sent_by_proctor

  def sent_by_proctor
    return if exam.proctors_and_professors.exists? sender.id

    errors.add(:sender, 'must be a proctor or professor')
  end
end
