# frozen_string_literal: true

# An announcement sent during an exam to all students.
class ExamAnnouncement < ApplicationRecord
  belongs_to :exam

  validates :exam, presence: true
  validates :body, presence: true

  def serialize
    # TODO
    {
      body: body,
      time: created_at,
      personal: false
    }
  end
end
