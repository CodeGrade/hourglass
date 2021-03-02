# frozen_string_literal: true

# Removes rubric information from exam version's `info` field.
# This information is now schematized in the database.
class RemoveRubricsFromExamInfo < ActiveRecord::Migration[6.0]
  def up
    ExamVersion.transaction do
      ExamVersion.all.each do |ev|
        ev.update(info: ev.info.reject { |k| k == 'rubrics' })
      end
    end
  end

  def down
    raise 'NOT IMPLEMENTED YET'
  end
end
