# frozen_string_literal: true

# An announcement sent during an exam to all students taking a particular version.
class VersionAnnouncement < ApplicationRecord
  belongs_to :exam_version

  delegate :exam, to: :exam_version
  delegate :visible_to?, to: :exam_version

  validates :body, presence: true
end
