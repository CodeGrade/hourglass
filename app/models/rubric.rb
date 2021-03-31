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
  validate :points_if_preset
  validate :not_both_presets_and_subsections
  validate :all_rubric_does_not_have_comments

  delegate :exam, to: :exam_version

  # Ensure that preset comments exist, or subsections exist, but not both
  def not_both_presets_and_subsections
    return unless rubric_preset.present? && subsections.present?

    errors.add(:subsections, 'must be empty if preset comments exist')
    errors.add(:rubric_preset, 'must be empty if subsections exist')
  end

  # Ensure that All rubrics do not have preset comments, since they should only have subsections
  def all_rubric_does_not_have_comments
    return unless type == 'all'
    return if rubric_preset.blank?

    errors.add(:rubric_preset, 'cannot be used with All-type rubrics')
  end
  
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

  def points_if_preset
    # NOTE: for new_records, the class is still Rubric, not All
    return if type == 'All'
    return if rubric_preset.nil?

    errors.add(:points, 'must not be nil if this contains presets') if points.nil?
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

  def as_json(preset_comments_in_use = nil)
    rubric_preset_as_json = rubric_preset&.as_json(preset_comments_in_use)
    subsections_as_json = subsections.sort_by(&:order).map { |s| s.as_json(preset_comments_in_use) }
    {
      type: type.downcase,
      description: description && { type: 'HTML', value: description },
      points: points,
      choices: (rubric_preset_as_json || subsections_as_json),
      inUse: (rubric_preset_as_json&.dig('inUse') || subsections_as_json.any? { |s| s['inUse'] }),
    }.compact
  end

  def change_type(new_type)
    Rubric.transaction do
      update(type: new_type)
      case new_type
      when 'none'
        rubric_preset.destroy!
        subsections.destroy_all!
        becomes!(None)
      when 'all'
        update(points: nil)
        becomes!(All)
      when 'any'
        becomes!(Any)
      when 'one'
        becomes!(One)
      end
    end
  end

  protected

  def confirm_complete(_reg, _comments, _checks)
    raise 'Individual rubric types should implement this'
  end
end
