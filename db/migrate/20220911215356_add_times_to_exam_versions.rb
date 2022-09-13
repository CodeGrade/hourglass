class AddTimesToExamVersions < ActiveRecord::Migration[6.1]
  def change
    add_column :exam_versions, :start_time, :datetime, null: true
    add_column :exam_versions, :end_time, :datetime, null: true
    add_column :exam_versions, :duration, :integer, null: true
  end
end
