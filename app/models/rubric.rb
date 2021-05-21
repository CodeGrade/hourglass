# frozen_string_literal: true

# Rubrics in an exam form a tree, whose leaves are RubricPresets
class Rubric < ApplicationRecord
  belongs_to :exam_version, inverse_of: :rubrics
  belongs_to :question, optional: true, inverse_of: :rubrics
  belongs_to :part, optional: true, inverse_of: :rubrics
  belongs_to :body_item, optional: true, inverse_of: :rubrics
  belongs_to :parent_section,
             class_name: 'Rubric',
             inverse_of: 'subsections',
             optional: true

  has_many :subsections,
           -> { order(:order) },
           class_name: 'Rubric',
           foreign_key: 'parent_section_id',
           inverse_of: 'parent_section',
           dependent: :destroy

  has_one :rubric_preset, dependent: :destroy

  validate :no_detached_parts
  validate :sensible_coordinates
  validate :points_if_preset
  validate :not_both_presets_and_subsections
  validate :all_rubric_does_not_have_comments
  validate :has_order_if_not_root
  validate :parent_has_no_presets

  delegate :exam, to: :exam_version
  delegate :course, to: :exam_version

  accepts_nested_attributes_for :subsections, :rubric_preset

  # Ensure that non-root rubrics have a non-nil `order` field
  def has_order_if_not_root
    return if parent_section.nil?

    errors.add(:order, 'must exist for non-root rubrics') if order.nil?
  end

  # Ensure that the parent rubric does not have a rubric preset
  def parent_has_no_presets
    return if parent_section.nil?

    errors.add(:parent_section, 'cannot already have rubric presets') if parent_section.rubric_preset.present?
  end

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

  # rubocop:disable Metrics/PerceivedComplexity
  def sensible_coordinates
    return if parent_section.nil? && order.nil?

    if parent_section.nil?
      qpb = "(#{question.index}, #{part.index}, #{body_item.index})"
      errors.add(:order, "must be nil if this is the root of #{qpb}")
    else
      errors.add(:question, "must match parent section's question") if question != parent_section.question
      errors.add(:part, "must match parent section's part") if part != parent_section.part
      errors.add(:body_item, "must match parent section's body item") if body_item != parent_section.body_item

      if order.nil?
        # if this is a root rubric, don't need order
        return if question.nil? || part.nil? || body_item.nil?

        qpb = "(#{question&.index || 'nil'}, #{part&.index || 'nil'}, #{body_item&.index || 'nil'})"
        errors.add(:order, "cannot be nil if this is a subrubric within #{qpb}")
      end
    end
  end
  # rubocop:enable Metrics/PerceivedComplexity

  def no_detached_parts
    return if question.present?

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

  def swap_subsections(index_from, index_to)
    swap_association(Rubric, subsections, :order, index_from, index_to)
  end

  def move_subsections(index_from, index_to)
    move_association(Rubric, subsections, :order, index_from, index_to)
  end

  # Returns all the rubrics in the tree of subsections rooted at this node
  def all_subsections
    inv_parent_id_map = Rubric.where(
      exam_version_id: exam_version_id,
      question_id: question_id,
      part_id: part_id,
      body_item: body_item_id,
    ).where.not(parent_section_id: nil).pluck(:id, :parent_section_id).to_h

    inv_parent_id_map[id] = true
    changed = true
    while changed
      changed = false
      inv_parent_id_map.each do |id, parent_id|
        if parent_id != true && inv_parent_id_map[parent_id] == true
          inv_parent_id_map[id] = true
          changed = true
        end
      end
    end
    keepers = inv_parent_id_map.keep_if { |_k, v| v == true }.keys
    Rubric.where(id: keepers)
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

  def as_json(preset_comments_in_use = nil, format:)
    rubric_preset_as_json = rubric_preset&.as_json(preset_comments_in_use, format: format)
    subsections_as_json = subsections.sort_by(&:order).map do |s|
      s.as_json(preset_comments_in_use, format: format)
    end
    {
      type: type.downcase,
      description: description,
      points: points,
      choices: (rubric_preset_as_json || subsections_as_json),
      inUse:
        if format == :export
          nil
        else
          (rubric_preset_as_json&.dig('inUse') || subsections_as_json.any? { |s| s['inUse'] })
        end,
    }.compact
  end

  def change_type(new_type)
    Rubric.transaction do
      update(type: new_type.capitalize)
      case new_type
      when 'none'
        update(points: 0, description: nil)
        rubric_preset&.destroy!
        subsections.destroy_all
        becomes(None)
      when 'all'
        update(points: nil)
        becomes(All)
      when 'any'
        update(points: 0)
        becomes(Any)
      when 'one'
        update(points: 0)
        becomes(One)
      end
    end
  end

  protected

  def confirm_complete(_reg, _comments, _checks)
    raise 'Individual rubric types should implement this'
  end
end
