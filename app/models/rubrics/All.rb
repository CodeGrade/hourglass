# frozen_string_literal: true

class All < Rubric
  def total_points
    if rubric_preset
      rubric_preset.total_points
    else
      subsections.sum{|s| s.total_points}
    end
  end

  def out_of
    if rubric_preset
      rubric_preset.total_points
    else
      subsections.sum{|s| s.out_of}
    end
  end
    
  protected
  def confirm_complete(reg, comments, checks)
    if rubric_preset
      preset_ids = rubric_preset.preset_comments.map(&:id)
      (comments.dig(qnum, pnum, bnum)&.slice(*preset_ids)&.count.to_i +
        checks.dig(qnum, pnum, bnum)&.count.to_i) == preset_ids.count
    else
      subsections.all?{|s| s.confirm_complete(reg, comments, checks)}
    end
  end

end