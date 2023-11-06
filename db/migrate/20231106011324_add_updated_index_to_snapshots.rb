class AddUpdatedIndexToSnapshots < ActiveRecord::Migration[6.1]
  def change
    change_table :snapshots do |t|
      t.index :created_at
    end
  end
end
