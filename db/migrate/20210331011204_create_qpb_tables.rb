class CreateQpbTables < ActiveRecord::Migration[6.0]
  def change
    change_table :exam_versions do |t|
      t.string 'instructions', null: false, default: ''
      t.string 'policies', null: false, default: ''
    end

    create_table :questions do |t|
      t.string 'name'
      t.string 'description'
      t.boolean 'extra_credit', null: false, default: false
      t.boolean 'separate_subparts', null: false, default: false

      t.references 'exam_version', null: false
      t.integer 'index', null: false

      t.index ['index', 'exam_version_id'], name: 'unique_question_index_per_exam', unique: true
    end

    create_table :parts do |t|
      t.string 'name'
      t.string 'description'
      t.float 'points', null: false
      t.boolean 'extra_credit', null: false, default: false

      t.references 'question', null: false
      t.integer 'index', null: false

      t.index ['index', 'question_id'], name: 'unique_part_index_per_question', unique: true
    end

    create_table :body_items do |t|
      t.jsonb 'info', null: false # TODO remember to json schema-ify this in the model
      t.jsonb 'answer', null: true

      t.references 'part', null: false
      t.integer 'index', null: false

      t.index ['index', 'part_id'], name: 'unique_body_item_per_part', unique: true
    end

    create_table :references do |t|
      t.string 'path', null: false
      t.string 'type', null: false

      t.references 'exam_version', null: false
      t.references 'question', null: true
      t.references 'part', null: true
      t.integer 'index', null: false

      t.index ['index', 'exam_version_id'], name: 'unique_reference_index_per_exam', unique: true, where: '(question_id IS NULL AND part_id IS NULL)'
      t.index ['index', 'exam_version_id', 'question_id'], name: 'unique_reference_index_per_question', unique: true, where: '(part_id IS NULL)'
      t.index ['index', 'exam_version_id', 'question_id', 'part_id'], name: 'unique_reference_index_per_part', unique: true
    end
  end
end
