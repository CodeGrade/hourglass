# frozen_string_literal: true

# An announcement sent during an exam to all students taking a particular version.
class VersionAnnouncement < ApplicationRecord
  belongs_to :exam_version

  delegate :exam, to: :exam_version

  validates :exam_version, presence: true
  validates :body, presence: true

  def visible_to?(check_user)
    exam.proctors_and_professors.or(exam_version.students).exists? check_user.id
  end
end
