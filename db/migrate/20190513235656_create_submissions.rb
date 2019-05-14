class CreateSubmissions < ActiveRecord::Migration[5.2]
  def change
    create_table :submissions do |t|
      t.integer :user_id, null: false
      t.integer :exam_id, null: false
      t.integer :upload_id, null: false
      t.boolean :final, null: false
      t.boolean :anomalous, null: false

      t.timestamps
    end
  end
end
