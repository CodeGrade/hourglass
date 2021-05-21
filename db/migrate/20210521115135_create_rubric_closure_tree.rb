class CreateRubricClosureTree < ActiveRecord::Migration[6.0]
  def up
    create_table :rubric_tree_paths do |t|
      t.references :ancestor, null: false, foreign_key: { to_table: :rubrics }
      t.references :descendant, null: false, foreign_key: { to_table: :rubrics }
      t.integer :path_length, null: false
      t.index [:ancestor_id, :descendant_id], unique: true
    end
    all_rubrics = Rubric.all.map { |r| [r.id, r] }.to_h
    all_rubrics.each do |r_id, r|
      RubricTreePath.create(ancestor: r, descendant: r, path_length: 0)
      parent = r.parent_section
      path_length = 1
      while parent
        RubricTreePath.create(ancestor: parent, descendant: r, path_length: path_length)
        parent = all_rubrics[parent.parent_section_id]
        path_length += 1
      end
    end
  end

  def down
    drop_table :rubric_tree_paths
  end
end
