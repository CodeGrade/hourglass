# frozen_string_literal: true

# A rubric subsection where any of the comments may be used
class Any < Rubric
  def total_points
    if rubric_preset
      rubric_preset.total_points
    else
      points
    end
  end

  protected

  def confirm_complete(reg, comments, checks)
    if rubric_preset
      preset_ids = rubric_preset.preset_comment_ids
      (slice_hash_on_qpb(comments, is_hash: true)&.slice(*preset_ids)&.count.to_i +
        slice_hash_on_qpb(checks, is_hash: false)&.count.to_i) >= 1
    else
      subsections.any? { |s| s.send(:confirm_complete, reg, comments, checks) }
    end
  end
end
