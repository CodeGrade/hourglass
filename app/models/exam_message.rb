# frozen_string_literal: true

# A message sent during an exam.
# If no recipient, this message is an announcement to all exam-takers.
class ExamMessage < ApplicationRecord
  belongs_to :exam
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User', optional: true

  validates :body, presence: true

  def serialize
    {
      body: body,
      time: created_at,
      personal: recipient.present?
    }
  end
end
