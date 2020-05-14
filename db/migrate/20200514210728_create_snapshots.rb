class CreateSnapshots < ActiveRecord::Migration[6.0]
  def change
    create_table :snapshots do |t|
      t.integer :registration_id, null: false
      t.jsonb :answers, null: false

      t.timestamps
    end
  end
end
