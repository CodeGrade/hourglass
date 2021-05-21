class RemoveRubricParentSection < ActiveRecord::Migration[6.0]
  def up
    change_table :rubrics do |t|
      t.remove :parent_section_id
    end
  end

  def down
    change_table :rubrics do |t|
      t.references :parent_section, null: true, foreign_key: { to_table: :rubrics }
    end
    RubricTreePath.where(path_length: 1) do |link|
      link.descendant.update(parent_section_id: link.ancestor_id)
    end
  end
end
