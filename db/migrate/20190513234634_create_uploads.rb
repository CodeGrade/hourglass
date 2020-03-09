# frozen_string_literal: true

class CreateUploads < ActiveRecord::Migration[5.2]
  def change
    create_table :uploads do |t|
      t.integer :user_id, null: false
      t.string :file_name, null: false
      t.string :secret_key, null: false
      t.integer :exam_id, null: false

      t.index :exam_id, unique: true
      t.timestamps
    end
  end
end
