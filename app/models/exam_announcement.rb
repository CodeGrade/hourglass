# frozen_string_literal: true

# An announcement sent during an exam to all registered students.
class ExamAnnouncement < ApplicationRecord
  belongs_to :exam

  validates :exam, presence: true
  validates :body, presence: true

  delegate :visible_to?, to: :exam
end
