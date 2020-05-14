class CreateExams < ActiveRecord::Migration[5.2]
  def change
    create_table :exams do |t|
      t.string :secret_key, null: false
      t.boolean :enabled, null: false
      t.string :name, null: false

      t.integer :duration, null: false
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false

      t.timestamps
    end
  end
end
