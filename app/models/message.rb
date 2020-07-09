# frozen_string_literal: true

# A message sent from a professor to a student during an exam.
class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :registration

  validates :sender, presence: true
  validates :registration, presence: true
  validates :body, presence: true, length: { maximum: 2000 }

  delegate :exam, to: :registration

  validate :sent_by_prof

  def sent_by_prof
    return if exam.course.professors.include? sender

    errors.add(:sender, 'must be a professor')
  end

  def serialize
    {
      id: id,
      body: body,
      time: created_at,
      type: 'personal',
    }
  end
end
