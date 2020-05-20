class CreateExams < ActiveRecord::Migration[5.2]
  def change
    create_table :exams do |t|
      t.boolean :enabled, null: false, default: false
      t.string :name, null: false
      t.integer :course_id, null: false
      t.integer :assignment_id

      t.jsonb :files, null: false
      t.jsonb :info, null: false

      t.timestamps
    end
  end
end
