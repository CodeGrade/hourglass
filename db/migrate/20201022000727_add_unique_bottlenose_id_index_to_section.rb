class AddUniqueBottlenoseIdIndexToSection < ActiveRecord::Migration[6.0]
  def change
    add_index :sections, [:bottlenose_id], unique: true
  end
end
