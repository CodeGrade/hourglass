class RemoveInfoFromExamVersions < ActiveRecord::Migration[6.0]
  def up
    change_table :exam_versions do |t|
      t.remove :info
    end
  end

  def down
    change_table :exam_versions do |t|
      t.jsonb :info, null: false, default: {placeholder: true}
    end
  end
end
