class AddPinsToStudentsRegistrations < ActiveRecord::Migration[6.1]
  def change
    change_table :exam_versions do |t|
      t.string :pin_nonce, null: true
      t.integer :pin_strength, null: false, default: 6
    end
    change_table :accommodations do |t|
      t.string :policy_exemptions, default: "", null: false
    end
    change_table :registrations do |t|
      t.integer :login_attempt_count, null: false, default: 0
      t.boolean :pin_validated, null: false, default: false
    end
  end
end
