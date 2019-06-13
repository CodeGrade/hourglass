class CreateSubmissions < ActiveRecord::Migration[5.2]
  def change
    create_table :submissions do |t|
      t.integer :user_id, null: false
      t.integer :exam_id, null: false
      t.boolean :final, default: false, null: false
      t.boolean :anomalous, default: false, null: false

      t.timestamps
    end
  end
end
