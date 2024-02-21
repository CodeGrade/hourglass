# frozen_string_literal: true

# An announcement sent during an exam to all students taking a particular version.
class VersionAnnouncement < ApplicationRecord
  belongs_to :exam_version

  has_one :exam, through: :exam_version
  delegate :visible_to?, to: :exam_version

  def exam
    super || exam_version.try(:exam)
  end

  validates :body, presence: true
end
