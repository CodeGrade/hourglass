# frozen_string_literal: true

class ExamVersion < ApplicationRecord
  belongs_to :exam

  has_many :registrations, through: :rooms
  has_many :users, through: :registrations
  has_many :anomalies, through: :registrations
  has_many :version_announcements, dependent: :destroy

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
end
