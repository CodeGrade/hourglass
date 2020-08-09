# frozen_string_literal: true

# Rubrics in an exam form a tree, whose leaves are RubricPresets
class Rubric < ApplicationRecord
  belongs_to :exam_version
  belongs_to :parent_section,
             class_name: 'Rubric',
             inverse_of: 'subsections',
             optional: true

  has_many :subsections,
           class_name: 'Rubric',
           foreign_key: 'parent_section_id',
           inverse_of: 'parent_section',
           dependent: :destroy

  has_one :rubric_preset, dependent: :destroy

  validate :sensible_coordinates

  def sensible_coordinates
    if qnum.nil?
      if pnum.nil?
        if bnum.nil?
          # Nothing: this is a valid coordinate triple
        else
          errors.add(:bnum, 'must be nil if qnum and pnum are nil')
        end
      else
        errors.add(:qnum, 'must be nil if qnum is nil')
      end
    end

    return if qnum.nil? || pnum.nil? || bnum.nil?

    if parent_section.nil?
      return if order.nil?

      errors.add(:order, "must be nil if this is the root of (#{qnum}, #{pnum}, #{bnum})")
    elsif order.nil?
      errors.add(:order, "cannot be nil if this is a subrubric within (#{qnum}, #{pnum}, #{bnum})")
    end
  end

  def exam_rubric?
    qnum.nil? && pnum.nil? && bnum.nil?
  end

  def question_rubric?
    qnum && pnum.nil? && bnum.nil?
  end

  def part_rubric?
    qnum && pnum && bnum.nil?
  end

  def body_rubric
    qnum && pnum && bnum && true
  end

  def in_use?
    rubric_preset&.in_use? || subsections.any?(&:in_use?)
  end

  def compute_grade_for(reg, comments, checks, qpb)
    if rubric_preset
      rubric_preset.compute_grade_for(reg, out_of, comments, checks, qpb)
    else
      subsections.sum { |s| s.compute_grade_for(reg, comments, checks, qpb) }
    end
  end

  def grading_complete_for(reg)
    coords = { qnum: qnum, pnum: pnum, bnum: bnum }
    comments = multi_group_by(
      reg.grading_comments.includes(:rubric_preset).where(coords),
      [:qnum, :pnum, :bnum, :preset_comment_id],
    )
    checks = multi_group_by(reg.grading_checks.where(coords), [:qnum, :pnum, :bnum])
    confirm_complete(reg, comments, checks)
  end

  def out_of
    points
  end

  def as_json
    {
      railsId: id,
      type: type.downcase,
      description: description && { type: 'HTML', value: description },
      points: points,
      choices: rubric_preset&.as_json || subsections.sort_by(&:order).map(&:as_json),
    }.compact
  end

  protected

  def confirm_complete(_reg, _comments, _checks)
    raise 'Individual rubric types should implement this'
  end
end
