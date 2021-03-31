# frozen_string_literal: true

# A body item, part of a question part.
class BodyItem < ApplicationRecord
  belongs_to :part

  def self.inheritance_column
    nil
  end
end
