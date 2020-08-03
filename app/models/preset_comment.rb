# frozen_string_literal: true

class PresetComment < ApplicationRecord
  belongs_to :rubric_preset
  # DON'T delete comments, but make them Unknown
  has_many :grading_comments, dependent: :nullify 

  def as_json
    {
      label: label,
      graderHint: grader_hint,
      studentFeedback: student_feedback,
      points: points
    }.compact
  end
end
