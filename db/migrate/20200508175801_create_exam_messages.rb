class CreateExamMessages < ActiveRecord::Migration[6.0]
  def change
    create_table :exam_messages do |t|
      t.integer :exam_id, null: false
      t.integer :sender_id, null: false
      t.integer :recipient_id, optional: true
      t.text :body, null: false

      t.timestamps
    end
  end
end
