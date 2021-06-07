class CreateQpbReferences < ActiveRecord::Migration[6.0]
  def multi_group_by(hash, keys, last_key_unique = false, index = 0)
    if index >= keys.count || hash.nil?
      hash
    elsif index == keys.count - 1 && last_key_unique
      Hash[hash.map { |v| [(v[keys[index]] rescue v.__send__(keys[index])), v]}]
    else
      Hash[hash.group_by(&(keys[index])).map { |k, v| [k, multi_group_by(v, keys, last_key_unique, index + 1)]}]
    end
  end

  def up
    questions_by_ev = multi_group_by(Question.all, [:exam_version_id, :index], true)
    parts_by_question = multi_group_by(Part.all, [:question_id, :index], true)
    body_items_by_part = multi_group_by(BodyItem.all, [:part_id, :index], true)

    change_table :grading_checks do |t|
      t.references :question
      t.references :part
      t.references :body_item
      t.remove_index name: :unique_check_per_item
      t.index [:question_id, :part_id]
      t.index [:question_id, :part_id, :body_item_id], name: 'index_grading_checks_on_coords'
    end
    puts "Updating #{GradingCheck.all.count} grading checks"
    GradingCheck.all.each do |gc|
      ev = gc.exam_version
      q = questions_by_ev[ev.id][gc.qnum]
      p = parts_by_question[q.id][gc.pnum]
      b = body_items_by_part[p.id][gc.bnum]
      gc.update(question: q, part: p, body_item: b)
    end
    change_column_null :grading_checks, :question_id, false
    change_column_null :grading_checks, :part_id, false
    change_column_null :grading_checks, :body_item_id, false
    puts "Done"

    change_table :grading_comments do |t|
      t.references :question
      t.references :part
      t.references :body_item
      t.index [:question_id, :part_id]
      t.index [:question_id, :part_id, :body_item_id], name: 'index_grading_comments_on_coords'
    end
    puts "Updating #{GradingComment.all.count} grading comments"
    GradingComment.all.includes(registration: :exam_version).each do |gc|
      ev = gc.exam_version
      q = questions_by_ev[ev.id][gc.qnum]
      p = parts_by_question[q.id][gc.pnum]
      b = body_items_by_part[p.id][gc.bnum]
      gc.update(question: q, part: p, body_item: b)
    end
    change_column_null :grading_comments, :question_id, false
    change_column_null :grading_comments, :part_id, false
    change_column_null :grading_comments, :body_item_id, false
    puts "Done"

    change_table :grading_locks do |t|
      t.references :question
      t.references :part
      t.remove_index name: :index_grading_locks_on_registration_id_and_qnum_and_pnum, unique: true
      t.index [:question_id, :part_id]
    end
    puts "Updating #{GradingLock.all.count} grading locks"
    GradingLock.all.includes(registration: :exam_version).each do |gl|
      ev = gl.exam_version
      q = questions_by_ev[ev.id][gl.qnum]
      p = parts_by_question[q.id][gl.pnum]
      gl.update(question: q, part: p)
    end
    change_column_null :grading_locks, :question_id, false
    change_column_null :grading_locks, :part_id, false
    puts "Done"

    change_table :rubrics do |t|
      t.references :question
      t.references :part
      t.references :body_item
      t.remove_index name: :unique_rubric_order_per_coords
      t.remove_index name: :unique_rubric_root_coords
      t.index [:question_id, :part_id]
      t.index [:question_id, :part_id, :body_item_id]
    end
    puts "Updating #{Rubric.all.count} rubrics"
    Rubric.all.includes(:exam_version).each do |r|
      ev = r.exam_version
      q = questions_by_ev[ev.id][r.qnum] if r.qnum
      p = parts_by_question[q.id][r.pnum] if r.pnum
      b = body_items_by_part[p.id][r.bnum] if r.bnum
      r.update(question: q, part: p, body_item: b)
    end
    puts "Done"
  end

  def down
    change_table :grading_checks do |t|
      t.remove :question_id
      t.remove :part_id
      t.remove :body_item_id
      t.index [:registration_id, :qnum, :pnum, :bnum], unique: true, name: :unique_check_per_item
    end

    change_table :grading_comments do |t|
      t.remove :question_id
      t.remove :part_id
      t.remove :body_item_id
    end

    change_table :grading_locks do |t|
      t.remove :question_id
      t.remove :part_id
      t.index [:registration_id, :qnum, :pnum], name: :index_grading_locks_on_registration_id_and_qnum_and_pnum, unique: true
    end

    change_table :rubrics do |t|
      t.remove :question_id
      t.remove :part_id
      t.remove :body_item_id
      t.index [:exam_version_id, :qnum, :pnum, :bnum, :order], name: :unique_rubric_order_per_coords, unique: true, where: '(parent_section_id IS NOT NULL)'
      t.index [:exam_version_id, :qnum, :pnum, :bnum], name: :unique_rubric_root_coords, unique: true, where: '(parent_section_id IS NULL)'
    end
  end
end
