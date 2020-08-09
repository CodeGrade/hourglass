# frozen_string_literal: true

# A collection of preset comments for an individual subsection of a rubric
class RubricPreset < ApplicationRecord
  belongs_to :rubric
  has_many :preset_comments, dependent: :destroy

  def total_points
    preset_comments.sum(&:points)
  end

  def in_use?
    preset_comments.any?(&:in_use?)
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

  def as_json
    {
      railsId: id,
      label: label,
      direction: direction,
      mercy: mercy,
      presets: preset_comments.sort_by(&:order).map(&:as_json),
    }.compact
  end
end
