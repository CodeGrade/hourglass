class RemoveQpbNums < ActiveRecord::Migration[6.0]
  def up
    change_table :grading_checks do |t|
      t.remove :qnum
      t.remove :pnum
      t.remove :bnum
      t.index [:registration_id, :question_id, :part_id, :body_item_id], name: :unique_check_per_item, unique: true
    end

    change_table :grading_comments do |t|
      t.remove :qnum
      t.remove :pnum
      t.remove :bnum
    end

    change_table :grading_locks do |t|
      t.remove :qnum
      t.remove :pnum
      t.index [:registration_id, :question_id, :part_id], name: :index_grading_locks_on_registration_id_and_qnum_and_pnum, unique: true
    end

    change_table :rubrics do |t|
      t.remove :qnum
      t.remove :pnum
      t.remove :bnum
      t.index [:exam_version_id, :question_id, :part_id, :body_item_id, :order], name: :unique_rubric_order_per_coords, unique: true, where: '(parent_section_id IS NOT NULL)'
      t.index [:exam_version_id, :question_id, :part_id, :body_item_id], name: :unique_rubric_root_coords, unique: true, where: '(parent_section_id IS NULL)'
    end
  end

  def down
    change_table :grading_checks do |t|
      t.integer :qnum
      t.integer :pnum
      t.integer :bnum
      t.remove_index name: :unique_check_per_item
    end
    GradingCheck.all.includes(:question, :part, :body_item).each do |gc|
      gc.update(
        qnum: gc.question.index,
        pnum: gc.part.index,
        bnum: gc.body_item.index,
      )
    end
    change_column_null :grading_checks, :qnum, false
    change_column_null :grading_checks, :pnum, false
    change_column_null :grading_checks, :bnum, false

    change_table :grading_comments do |t|
      t.integer :qnum
      t.integer :pnum
      t.integer :bnum
    end
    GradingComment.all.includes(:question, :part, :body_item).each do |gc|
      gc.update(
        qnum: gc.question&.index,
        pnum: gc.part&.index,
        bnum: gc.body_item&.index,
      )
    end
    change_column_null :grading_comments, :qnum, false
    change_column_null :grading_comments, :pnum, false
    change_column_null :grading_comments, :bnum, false

    change_table :grading_locks do |t|
      t.integer :qnum
      t.integer :pnum
      t.remove_index name: :index_grading_locks_on_registration_id_and_qnum_and_pnum
    end
    GradingLock.all.includes(:question, :part).each do |gl|
      gl.update(
        qnum: gl.question.index,
        pnum: gl.part.index,
      )
    end
    change_column_null :grading_locks, :qnum, false
    change_column_null :grading_locks, :pnum, false

    change_table :rubrics do |t|
      t.integer :qnum
      t.integer :pnum
      t.integer :bnum
      t.remove_index name: :unique_rubric_order_per_coords
      t.remove_index name: :unique_rubric_root_coords
    end
    Rubric.all.includes(:question, :part, :body_item).each do |r|
      r.update(
        qnum: r.question&.index,
        pnum: r.part&.index,
        bnum: r.body_item&.index,
      )
    end
  end
end
