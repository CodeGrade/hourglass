# frozen_string_literal: true

# A single version of an exam.
class ExamVersion < ApplicationRecord
  belongs_to :exam

  has_many :registrations, dependent: :destroy
  has_many :version_announcements, dependent: :destroy

  has_many :users, through: :registrations
  has_many :anomalies, through: :registrations

  validates :exam, presence: true

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

  def policies
    info['policies']
  end

  def contents
    info['contents']
  end

  def answers
    info['answers']
  end

  def default_answers
    {
      answers: answers.map do |ans_q|
        ans_q.map do |ans_p|
          ans_p.map { |_| { "NO_ANS": true } }
        end
      end,
      scratch: ''
    }
  end
end
