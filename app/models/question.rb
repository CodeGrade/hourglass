# frozen_string_literal: true

# An exam question, part of an exam version.
class Question < ApplicationRecord
  belongs_to :exam_version, inverse_of: :db_questions

  has_many :parts, -> { order(:index) }, dependent: :destroy, inverse_of: :question
  has_many :references, -> { order(:index) }, dependent: :destroy
  has_many :rubrics, -> { order(:order) }, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :exam_version
  delegate :course, to: :exam_version

  accepts_nested_attributes_for :parts, :rubrics, :references

  def as_json
    root_rubric = rubrics.find_by(
      part: nil,
      body_item: nil,
      order: nil,
    )
    rubric_as_json =
      if root_rubric.nil? || root_rubric.is_a?(None)
        nil
      else
        root_rubric.as_json(no_inuse: true).deep_stringify_keys
      end
    {
      'name' => compact_blank(name),
      'description' => compact_blank(description),
      'extraCredit' => extra_credit || nil,
      'separateSubparts' => separate_subparts,
      'reference' => compact_blank(references.where(
        part: nil,
      ).order(:index).map(&:as_json)),
      'questionRubric' => rubric_as_json,
      'parts' => parts.order(:index).map(&:as_json),
    }.compact
  end

  def swap_parts(index_from, index_to)
    swap_association(Part, parts, :index, index_from, index_to)
  end

  def move_parts(index_from, index_to)
    move_association(Part, parts, :index, index_from, index_to)
  end

  def swap_references(index_from, index_to)
    swap_association(Reference, references, :index, index_from, index_to)
  end

  def move_references(index_from, index_to)
    move_association(Reference, references, :index, index_from, index_to)
  end
end
