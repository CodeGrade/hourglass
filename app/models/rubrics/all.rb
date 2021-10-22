# frozen_string_literal: true

# A rubric section where all subsections must be used
class All < Rubric
  def total_points
    if rubric_preset
      rubric_preset.total_points
    else
      subsections.sum(&:total_points)
    end
  end

  def out_of
    if rubric_preset
      rubric_preset.total_points
    else
      subsections.sum(&:out_of)
    end
  end

  protected

  def confirm_complete(reg, comments, checks)
    if rubric_preset
      preset_ids = rubric_preset.preset_comment_ids
      (comments.dig(question_id, part_id, body_item_id)&.slice(*preset_ids)&.count.to_i +
        checks.dig(question_id, part_id, body_item_id)&.count.to_i) == preset_ids.count
    else
      subsections.all? { |s| s.send(:confirm_complete, reg, comments, checks) }
    end
  end
end
