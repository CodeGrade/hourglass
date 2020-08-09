# frozen_string_literal: true

# An empty section of the rubric
class None < Rubric
  def total_points
    0
  end

  def out_of
    0
  end

  def as_json
    {
      railsId: id,
      type: 'none',
    }
  end

  protected

  def confirm_complete(_reg, _comments, _checks)
    true
  end
end
