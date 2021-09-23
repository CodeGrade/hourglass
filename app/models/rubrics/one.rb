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

  def compute_grade_for(reg, comments, checks, qpb)
    qnum, pnum, bnum = qpb
    if rubric_preset
      preset_ids = rubric_preset.preset_comment_ids
      if comments.dig(qnum, pnum, bnum)&.slice(*preset_ids)&.count.to_i > 0
        rubric_preset.compute_grade_for(reg, out_of, comments, checks, qpb)
      else
        puts "HERE1"
        points
      end
    else
      used_section = subsections.find { |s| s.send(:confirm_complete, reg, comments, checks) }
      if used_section
        puts "Found used_section #{used_section.type} #{used_section.id}"
        used_section.compute_grade_for(reg, comments, checks, qpb)
      else
        puts "HERE2"
        points
      end
    end
  end

  protected

  def confirm_complete(reg, comments, checks)
    if rubric_preset.nil?
      subsections.one? { |s| s.send(:confirm_complete, reg, comments, checks) }
    else
      preset_ids = rubric_preset.preset_comment_ids
      (comments.dig(question_id, part_id, body_item_id)&.slice(*preset_ids)&.count.to_i +
        checks.dig(question_id, part_id, body_item_id)&.count.to_i) == 1
    end
  end
end
