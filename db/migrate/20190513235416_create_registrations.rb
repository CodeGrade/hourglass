class CreateRegistrations < ActiveRecord::Migration[5.2]
  def change
    create_table :registrations do |t|
      t.integer "exam_id", null: false
      t.integer "user_id", null: false
      t.boolean "admin", default: false, null: false

      t.timestamps
    end
  end
end
