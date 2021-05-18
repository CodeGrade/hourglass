# frozen_string_literal: true

# Rubric uniqueness was not enforced properly.
# This migration sets up the proper indices for uniqueness to work properly.
class FixRubricUniquenessIndices < ActiveRecord::Migration[6.0]
  def up
    change_table(:rubrics) do |t|
      t.remove_index name: 'unique_rubric_order_per_coords'
      t.index ['exam_version_id', 'order'], name: 'unique_rubric_order_per_ev', unique: true, where: '(parent_section_id IS NOT NULL AND question_id IS NULL AND part_id IS NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id', 'order'], name: 'unique_rubric_order_per_question', unique: true, where: '(parent_section_id IS NOT NULL AND question_id IS NOT NULL AND part_id IS NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id', 'part_id', 'order'], name: 'unique_rubric_order_per_part', unique: true, where: '(parent_section_id IS NOT NULL AND question_id IS NOT NULL AND part_id IS NOT NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id', 'part_id', 'body_item_id', 'order'], name: 'unique_rubric_order_per_body_item', unique: true, where: '(parent_section_id IS NOT NULL AND question_id IS NOT NULL AND part_id IS NOT NULL AND body_item_id IS NOT NULL)'


      t.remove_index name: 'unique_rubric_root_coords'
      t.index ['exam_version_id'], name: 'unique_rubric_root_coords_ev', unique: true, where: '(parent_section_id IS NULL AND question_id IS NULL AND part_id IS NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id'], name: 'unique_rubric_root_coords_questions', unique: true, where: '(parent_section_id IS NULL AND question_id IS NOT NULL AND part_id IS NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id', 'part_id'], name: 'unique_rubric_root_coords_parts', unique: true, where: '(parent_section_id IS NULL AND question_id IS NOT NULL AND part_id IS NOT NULL AND body_item_id IS NULL)'
      t.index ['exam_version_id', 'question_id', 'part_id', 'body_item_id'], name: 'unique_rubric_root_coords_body_items', unique: true, where: '(parent_section_id IS NULL AND question_id IS NOT NULL AND part_id IS NOT NULL AND body_item_id IS NOT NULL)'
    end
  end

  def down
    change_table(:rubrics) do |t|
      t.remove_index 'unique_rubric_order_per_ev'
      t.remove_index 'unique_rubric_order_per_question'
      t.remove_index 'unique_rubric_order_per_part'
      t.remove_index 'unique_rubric_order_per_body_item'
      t.index ["exam_version_id", "question_id", "part_id", "body_item_id", "order"], name: "unique_rubric_order_per_coords", unique: true, where: "(parent_section_id IS NOT NULL)"

      t.remove_index 'unique_rubric_root_coords_ev'
      t.remove_index 'unique_rubric_root_coords_questions'
      t.remove_index 'unique_rubric_root_coords_parts'
      t.remove_index 'unique_rubric_root_coords_body_items'
      t.index ["exam_version_id", "question_id", "part_id", "body_item_id"], name: "unique_rubric_root_coords", unique: true, where: "(parent_section_id IS NULL)"
    end
  end
end
