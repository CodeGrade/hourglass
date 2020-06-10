# frozen_string_literal: true

# A message sent from a professor to a student during an exam.
class Message < ApplicationRecord
  belongs_to :exam
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User'

  validates :sender, presence: true
  validates :recipient, presence: true
  validates :body, presence: true

  validate :sent_by_prof

  def sent_by_prof
    return if exam.course.professors.include? sender

    errors.add(:base, 'Must be prof to send a message.')
  end

  def serialize
    # TODO
    {
      body: body,
      time: created_at,
      personal: true
    }
  end
end
