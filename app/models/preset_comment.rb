# frozen_string_literal: true

# Individual preset (grader suggestion and student feedback) comments for grading
class PresetComment < ApplicationRecord
  belongs_to :rubric_preset
  # DON'T delete comments, but make them Unknown
  has_many :grading_comments, dependent: :nullify

  delegate :exam_version, to: :rubric_preset
  delegate :exam, to: :exam_version

  def in_use?
    !grading_comments.empty?
  end

  def as_json(preset_comments_in_use = nil)
    {
      label: label,
      graderHint: grader_hint,
      studentFeedback: student_feedback,
      points: points,
      inUse:
        if preset_comments_in_use.nil?
          in_use?
        else
          preset_comments_in_use.member? id
        end,
    }.compact
  end
end
