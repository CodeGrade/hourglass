# frozen_string_literal: true

class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :rooms
  has_many :exam_messages

  after_initialize :generate_secret_key!

  # TODO: json schema validation for info
  # EXAM_SAVE_SCHEMA = Rails.root.join('config/schemas/exam-save-schema.json').to_s
  # validates :info, presence: true, json: {
  #   schema: :info_schema,
  #   message: ->(errors) { errors }
  # }

  # TODO: json schema validation for files

  # def info_schema
  #   EXAM_SAVE_SCHEMA
  # end

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    rooms.map(&:finalize!)
  end

  def policy_permits?(policy)
    policies.include? policy
  end

  def generate_secret_key!
    return unless new_record?

    unless secret_key.nil?
      raise Exception.new("Can't generate a second secret key for an exam.")
    end

    self.secret_key = SecureRandom.urlsafe_base64
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
end
