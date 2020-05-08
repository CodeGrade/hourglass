# frozen_string_literal: true

# A message sent during an exam.
# If no recipient and sender is student, message to profs.
# If no recipient and sender is prof, announcement.
class ExamMessage < ApplicationRecord
  belongs_to :exam
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User', optional: true

  validates :sender, presence: true
  validates :body, presence: true
  validate :private_message_only_by_prof

  def private_message_only_by_prof
    # anyone can send a message without a recipient
    return true if recipient.nil?

    # a student can't send a message with a recipient
    return true unless sender&.reg_for(exam)&.student?

    errors.add(:base, 'Students cannot send private messages.')
    false
  end

  def announcement?
    recipient.nil? && sender.reg_for(exam).professor?
  end

  def question?
    recipient.nil? && sender.reg_for(exam).student?
  end

  def serialize
    {
      body: body,
      time: created_at,
      personal: recipient.present?
    }
  end
end
