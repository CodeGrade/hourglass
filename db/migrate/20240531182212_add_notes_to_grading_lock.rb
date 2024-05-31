class AddNotesToGradingLock < ActiveRecord::Migration[6.1]
  def change
    change_table :grading_locks do |t|
      t.string :notes, null: false, default: ""
    end
  end
end
