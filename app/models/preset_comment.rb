# frozen_string_literal: true

# Individual preset (grader suggestion and student feedback) comments for grading
class PresetComment < ApplicationRecord
  belongs_to :rubric_preset
  # DON'T delete comments, but make them Unknown
  has_many :grading_comments, dependent: :nullify

  def in_use
    !grading_comments.empty?
  end

  def as_json
    {
      railsId: id,
      label: label,
      graderHint: grader_hint,
      studentFeedback: student_feedback,
      points: points,
    }.compact
  end
end
