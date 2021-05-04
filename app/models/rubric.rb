# frozen_string_literal: true

# Rubrics in an exam form a tree, whose leaves are RubricPresets
class Rubric < ApplicationRecord
  belongs_to :exam_version
  belongs_to :question, optional: true
  belongs_to :part, optional: true
  belongs_to :body_item, optional: true
  belongs_to :parent_section,
             class_name: 'Rubric',
             inverse_of: 'subsections',
             optional: true

  has_many :subsections, -> { order(:order) },
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

  accepts_nested_attributes_for :subsections, :rubric_preset

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
    if question.nil?
      if part.nil?
        if body_item.nil?
          # Nothing: this is a valid coordinate triple
        else
          errors.add(:body_item, 'must be nil if question and part are nil')
        end
      else
        errors.add(:part, 'must be nil if question is nil')
      end
    end

    return if question.nil? || part.nil? || body_item.nil?

    if parent_section.nil?
      return if order.nil?

      qpb = "(#{question.index}, #{part.index}, #{body_item.index})"
      errors.add(:order, "must be nil if this is the root of #{qpb}")
    elsif order.nil?
      qpb = "(#{question.index}, #{part.index}, #{body_item.index})"
      errors.add(:order, "cannot be nil if this is a subrubric within #{qpb}")
    end
  end

  def swap_subsections(index_from, index_to)
    swap_association(Rubric, subsections, :order, index_from, index_to)
  end

  def move_subsections(index_from, index_to)
    move_association(Rubric, subsections, :order, index_from, index_to)
  end

  def points_if_preset
    # NOTE: for new_records, the class is still Rubric, not All
    return if type == 'All'
    return if rubric_preset.nil?

    errors.add(:points, 'must not be nil if this contains presets') if points.nil?
  end

  def exam_rubric?
    question.nil? && part.nil? && body_item.nil?
  end

  def question_rubric?
    question && part.nil? && body_item.nil?
  end

  def part_rubric?
    question && part && body_item.nil?
  end

  def body_rubric
    question && part && body_item && true
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

  def as_json(preset_comments_in_use = nil, no_inuse: false)
    rubric_preset_as_json = rubric_preset&.as_json(preset_comments_in_use, no_inuse: no_inuse)
    subsections_as_json = subsections.sort_by(&:order).map do |s|
      s.as_json(preset_comments_in_use, no_inuse: no_inuse)
    end
    {
      type: type.downcase,
      description: description,
      points: points,
      choices: (rubric_preset_as_json || subsections_as_json),
      inUse:
        if no_inuse
          nil
        else
          (rubric_preset_as_json&.dig('inUse') || subsections_as_json.any? { |s| s['inUse'] })
        end,
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
