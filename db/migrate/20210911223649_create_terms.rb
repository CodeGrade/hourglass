class CreateTerms < ActiveRecord::Migration[6.0]
  def up
    create_table :terms do |t|
      t.integer :semester, null: false
      t.integer :year, null: false
      t.boolean :archived, default: false, null: false

      t.timestamps
      t.index ["semester", "year"], name: "index_terms_on_semester_and_year", unique: true
    end
    empty_term = Term.create(semester: Term.semesters["fall"], year: 2000)
    change_table :courses do |t|
      t.references :term, foreign_key: true
    end
    change_column_null :courses, :term_id, false, empty_term.id
  end
end
