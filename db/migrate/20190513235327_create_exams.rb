# frozen_string_literal: true

class CreateExams < ActiveRecord::Migration[5.2]
  def change
    create_table :exams do |t|
      t.string :secret_key, null: false
      t.boolean :enabled, null: false
      t.string :name, null: false

      t.timestamps
    end
  end
end
