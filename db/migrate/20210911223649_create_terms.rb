class CreateTerms < ActiveRecord::Migration[6.0]
  def up
    create_table :terms do |t|
      t.integer :semester, default: 0, null: false
      t.integer :year, default: 0, null: false
      t.boolean :archived, default: false, null: false

      t.timestamps
      t.index ["semester", "year"], name: "index_terms_on_semester_and_year", unique: true
    end
    empty_term = Term.create
    change_table :courses do |t|
      t.integer :term_id
    end
    change_column_null :courses, :term_id, false, empty_term.id
  end
end
