# frozen_string_literal: true

# Rubrics in an exam form a tree, whose leaves are RubricPresets
class Rubric < ApplicationRecord
  belongs_to :exam_version, inverse_of: :rubrics
  belongs_to :question, optional: true, inverse_of: :rubrics
  belongs_to :part, optional: true, inverse_of: :rubrics
  belongs_to :body_item, optional: true, inverse_of: :rubrics
  
  has_many :ancestor_links, # This rubric's ancestors are ones with it as a descendant
           class_name: 'RubricTreePath',
           foreign_key: 'descendant_id'
  has_many :ancestors, through: :ancestor_links
  has_many :descendant_links, # This rubric's descendants are ones with it as an ancestor
           class_name: 'RubricTreePath',
           foreign_key: 'ancestor_id'
  has_many :descendants, through: :descendant_links
  has_many :subsection_links, -> { where(path_length: 1) },
           class_name: 'RubricTreePath',
           foreign_key: 'ancestor_id'
  has_many :subsections, 
           through: :subsection_links,
           source: 'descendant'
  has_one :parent_section_link, -> { where(path_length: 1) },
          class_name: 'RubricTreePath',
          foreign_key: 'descendant_id'
  has_one :parent_section,
          through: :parent_section_link,
          source: 'ancestor'
  
  scope :root_rubrics, -> {
    joins(:ancestor_links).group('id').having('count(rubrics.id) = 1')
  }

  before_create do
    self_link = RubricTreePath.new(ancestor: self, descendant: self, path_length: 0)
    association(:descendant_links).add_to_target(self_link)
    association(:ancestor_links).add_to_target(self_link)
  end
  before_destroy do
    ancestor_links.destroy_all

    descs = descendants.pluck(:id)

    descendant_links.destroy_all
    Rubric.where(id: descs).destroy_all
  end

  has_one :rubric_preset, dependent: :destroy

  validate :no_detached_parts
  validate :points_if_preset
  validate :not_both_presets_and_subsections
  validate :all_rubric_does_not_have_comments
  validate :has_order_if_not_root
  validate :parent_has_no_presets

  delegate :exam, to: :exam_version
  delegate :course, to: :exam_version

  accepts_nested_attributes_for :rubric_preset

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
