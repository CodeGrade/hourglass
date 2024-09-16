# frozen_string_literal: true

# A collection of preset comments for an individual subsection of a rubric
class RubricPreset < ApplicationRecord
  belongs_to :rubric
  has_many :preset_comments, -> { order(:order) }, dependent: :destroy, inverse_of: :rubric_preset

  has_one :exam_version, through: :rubric
  has_one :exam, through: :exam_version

  def exam_version
    super || rubric.try(:exam_version)
  end

  def exam
    super || exam_version.try(:exam)
  end

  accepts_nested_attributes_for :preset_comments

  def total_points
    preset_comments.sum(&:points)
  end

  def in_use?
    preset_comments.includes(:grading_comments).any?(&:in_use?)
  end

  def compute_grade_for(_reg, max_points, comments, checks, qpb)
    my_comments = comments.dig(*qpb)&.values_at(*preset_comment_ids)&.compact || []
    my_checks = checks.dig(*qpb) || []
    raw_score = my_comments.flatten.sum do |c|
      c.points || c.rubric_preset.points
    end + my_checks.sum(&:points)

    if direction == 'credit'
      raw_score
    else
      (max_points.to_f + raw_score)
    end
  end

  def as_json(preset_comments_in_use = nil, format:)
    presets_as_json = preset_comments.sort_by(&:order).map do |p|
      p.as_json(preset_comments_in_use, format:)
    end
    {
      label:,
      direction:,
      mercy:,
      presets: presets_as_json,
      inUse: format == :export ? nil : presets_as_json.any? { |p| p['inUse'] },
    }.compact
  end

  def swap_preset_comments(index_from, index_to)
    swap_association(PresetComment, preset_comments, :order, index_from, index_to)
  end

  def move_preset_comments(index_from, index_to)
    move_association(PresetComment, preset_comments, :order, index_from, index_to)
  end
end
