# frozen_string_literal: true

# Individual preset (grader suggestion and student feedback) comments for grading
class PresetComment < ApplicationRecord
  belongs_to :rubric_preset
  # DON'T delete comments, but make them Unknown
  has_many :grading_comments, dependent: :nullify

  has_one :exam_version, through: :rubric_preset
  has_one :exam, through: :exam_version

  def exam_version
    super || rubric_preset.try(:exam_version)
  end

  def exam
    super || exam_version.try(:exam)
  end

  def in_use?
    !grading_comments.empty?
  end

  def as_json(preset_comments_in_use = nil, format:)
    {
      label:,
      graderHint: grader_hint,
      studentFeedback: student_feedback,
      points:,
      inUse:
        if format == :export
          nil
        elsif preset_comments_in_use.nil?
          in_use?
        else
          preset_comments_in_use.member? id
        end,
    }.compact
  end
end
