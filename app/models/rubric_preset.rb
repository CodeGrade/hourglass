# frozen_string_literal: true

# A collection of preset comments for an individual subsection of a rubric
class RubricPreset < ApplicationRecord
  belongs_to :rubric
  has_many :preset_comments, dependent: :destroy

  delegate :exam_version, to: :rubric
  delegate :exam, to: :exam_version

  def total_points
    preset_comments.sum(&:points)
  end

  def in_use?
    preset_comments.includes(:grading_comments).any?(&:in_use?)
  end

  def compute_grade_for(_reg, max_points, comments, checks, qpb)
    preset_ids = preset_comments.map(&:id)
    my_comments = comments.dig(*qpb)&.slice(*preset_ids) || []
    my_checks = checks.dig(*qpb) || []
    raw_score = my_comments.sum do |c|
      c.points || c.rubric_preset.points
    end + my_checks.sum { |c| c.points.to_f }

    if direction == 'credit'
      raw_score
    else
      (max_points.to_f - raw_score)
    end
  end

  def as_json(preset_comments_in_use = nil)
    presets_as_json = preset_comments.sort_by(&:order).map{ |p| p.as_json(preset_comments_in_use) }
    {
      railsId: id,
      label: label,
      direction: direction,
      mercy: mercy,
      presets: presets_as_json,
      inUse: presets_as_json.any?{ |p| p['inUse'] },
    }.compact
  end
end
