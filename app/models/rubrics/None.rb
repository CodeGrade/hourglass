# frozen_string_literal: true

class None < Rubric
  def total_points
    0
  end

  def out_of
    0
  end

  def as_json
    {
      type: "none"
    }
  end

  protected
  def confirm_complete(reg, comments, checks)
    true
  end
end