class CreateAnomalies < ActiveRecord::Migration[5.2]
  def change
    create_table :anomalies do |t|
      t.integer :registration_id, null: false
      t.string :reason, null: false

      t.timestamps
    end
  end
end
