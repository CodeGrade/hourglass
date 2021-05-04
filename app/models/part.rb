# frozen_string_literal: true

# An question part, part of a question.
class Part < ApplicationRecord
  belongs_to :question

  has_many :body_items, dependent: :destroy
  has_many :references, dependent: :destroy
  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :question
  delegate :course, to: :question

  accepts_nested_attributes_for :body_items, :rubrics, :references

  def as_json
    root_rubric = rubrics.find_by(body_item: nil, order: nil)
    rubric_as_json = if root_rubric.nil? || root_rubric.is_a?(None)
      nil
    else
      root_rubric.as_json(nil, true).deep_stringify_keys
    end
    {
      'name' => blank_to_nil(name),
      'description' => blank_to_nil(description),
      'points' => points,
      'extraCredit' => extra_credit,
      'reference' => blank_to_nil(references.order(:index).map(&:as_json)),
      'partRubric' => rubric_as_json,
      'body' => body_items.order(:index).map(&:as_json),
    }.compact
  end

  def blank_to_nil(val)
    return nil if val.blank?
    
    val
  end
end
