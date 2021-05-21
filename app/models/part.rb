# frozen_string_literal: true

# An question part, part of a question.
class Part < ApplicationRecord
  belongs_to :question, inverse_of: :parts

  has_many :body_items, -> { order(:index) }, dependent: :destroy, inverse_of: :part
  has_many :references, -> { order(:index) }, dependent: :destroy, inverse_of: :part
  has_many :rubrics, -> { order(:order) }, dependent: :destroy, inverse_of: :part
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :question
  delegate :course, to: :question

  accepts_nested_attributes_for :body_items, :rubrics, :references

  def root_rubric
    rubrics.where(
      body_item: nil
    ).root_rubrics.first
  end

  def as_json(format:)
    rubric_as_json =
      if root_rubric.nil? || root_rubric.is_a?(None)
        nil
      else
        root_rubric.as_json(format: format).deep_stringify_keys
      end
    {
      'name' => compact_blank(name),
      'description' => compact_blank(description),
      'points' => points,
      'extraCredit' => extra_credit || nil,
      (format == :export ? 'reference' : 'references') =>
        compact_blank(references.order(:index).map { |ref| ref.as_json(format: format) }),
      'partRubric' => rubric_as_json,
      (format == :export ? 'body' : 'bodyItems') =>
        body_items.order(:index).map { |b| b.as_json(format: format) },
    }.compact
  end

  def swap_body_items(index_from, index_to)
    swap_association(BodyItem, body_items, :index, index_from, index_to)
  end

  def move_body_items(index_from, index_to)
    move_association(BodyItem, body_items, :index, index_from, index_to)
  end

  def swap_references(index_from, index_to)
    swap_association(Reference, references, :index, index_from, index_to)
  end

  def move_references(index_from, index_to)
    move_association(Reference, references, :index, index_from, index_to)
  end
end
