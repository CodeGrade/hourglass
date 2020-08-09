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
      preset_ids = rubric_preset.preset_comments.map(&:id)
      (comments.dig(qnum, pnum, bnum)&.slice(*preset_ids)&.count.to_i +
        checks.dig(qnum, pnum, bnum)&.count.to_i) >= 1
    else
      subsections.any? { |s| s.confirm_complete(reg, comments, checks) }
    end
  end
end
