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
      preset_ids = rubric_preset.preset_comments.map(&:id)
      (comments.dig(qnum, pnum, bnum)&.slice(*preset_ids)&.count.to_i +
        checks.dig(qnum, pnum, bnum)&.count.to_i) == preset_ids.count
    else
      subsections.all? { |s| s.confirm_complete(reg, comments, checks) }
    end
  end
end
