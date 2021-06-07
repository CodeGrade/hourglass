# frozen_string_literal: true

# Marks `order` as required for preset comments.
class MarkPresetCommentsOrderRequired < ActiveRecord::Migration[6.0]
  def up
    PresetComment.all.group_by(&:rubric_preset_id).each do |_, comments|
      max_order = comments.map(&:order).compact.max || -1
      missing_order_comments = comments.filter { |c| c.order.nil? }
      missing_order_comments.each_with_index do |comment, index|
        comment.update(order: max_order + index + 1)
      end
    end
    change_column :preset_comments, :order, :integer, null: false
  end

  def down
    change_column :preset_comments, :order, :integer, null: true
  end
end
