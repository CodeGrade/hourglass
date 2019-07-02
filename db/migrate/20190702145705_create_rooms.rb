class CreateRooms < ActiveRecord::Migration[5.2]
  def change
    create_table :rooms do |t|
      t.integer :exam_id, null: false
      t.string :name, null: false

      t.timestamps
    end
  end
end
