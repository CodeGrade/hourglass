# frozen_string_literal: true

class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :anomalies, through: :registrations
  has_many :rooms
  has_many :exam_messages

  EXAM_SAVE_SCHEMA = Rails.root.join('config/schemas/exam-save.json').to_s
  validates :info, presence: true, json: {
    schema: -> { EXAM_SAVE_SCHEMA },
    message: ->(errors) { errors }
  }

  FILES_SCHEMA = Rails.root.join('config/schemas/files.json').to_s
  validates :files, presence: true, allow_blank: true, json: {
    schema: -> { FILES_SCHEMA },
    message: ->(errors) { errors }
  }

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    rooms.map(&:finalize!)
  end

  def professors
    registrations.includes(:user).where(role: 'professor').map(&:user)
  end

  def students
    registrations.includes(:user).where(role: 'student').map(&:user)
  end

  def announcements
    exam_messages.where(recipient: nil, sender: professors)
  end

  def questions
    exam_messages.where(recipient: nil, sender: students)
  end

  def questions_by(user)
    exam_messages.where(recipient: nil, sender: user)
  end

  def private_messages_for(user)
    exam_messages.where(recipient: user)
  end

  def all_messages_for(user)
    if user.reg_for(self).professor?
      questions.or(announcements)
    else
      private_messages_for(user).or(announcements)
    end
  end

  def version(num)
    info['versions'][num]
  end

  # Return the exam version for the given registration.
  def version_for(_reg)
    version(0)
  end
end
