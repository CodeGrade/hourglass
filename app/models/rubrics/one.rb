# frozen_string_literal: true

# A rubric section where exactly one item must be used
class One < Rubric
  def total_points
    if rubric_preset
      points.to_f # TODO: fix so that this isn't ever nil
    else
      subsections.first.total_points
    end
  end

  protected

  def confirm_complete(reg, comments, checks)
    if rubric_preset.nil?
      subsections.one? { |s| s.confirm_complete(reg, comments, checks) }
    else
      preset_ids = rubric_preset.preset_comments.map(&:id)
      (comments.dig(qnum, pnum, bnum)&.slice(*preset_ids)&.count.to_i +
        checks.dig(qnum, pnum, bnum)&.count.to_i) == 1
    end
  end
end
