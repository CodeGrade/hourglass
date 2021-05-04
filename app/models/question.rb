# frozen_string_literal: true

# An exam question, part of an exam version.
class Question < ApplicationRecord
  belongs_to :exam_version

  has_many :parts, dependent: :destroy
  has_many :references, dependent: :destroy
  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :exam_version
  delegate :course, to: :exam_version

  def as_json
    root_rubric = rubrics.find_by(
      part: nil,
      body_item: nil,
      order: nil
    )
    rubric_as_json = if root_rubric.nil? || root_rubric.is_a?(None)
      nil
    else
      root_rubric.as_json(nil, true).deep_stringify_keys
    end
    {
      'name' => blank_to_nil(name),
      'description' => blank_to_nil(description),
      'extraCredit' => extra_credit,
      'separateSubparts' => separate_subparts,
      'reference' => blank_to_nil(references.where(
        part: nil
      ).order(:index).map(&:as_json)),
      'questionRubric' => rubric_as_json,
      'parts' => parts.order(:index).map(&:as_json),
    }.compact
  end

  def blank_to_nil(val)
    return nil if val.blank?
    
    val
  end
end
