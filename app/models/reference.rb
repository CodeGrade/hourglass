# frozen_string_literal: true

# A file reference for an exam version, question, or part.
class Reference < ApplicationRecord
  belongs_to :exam_version
  belongs_to :question, optional: true
  belongs_to :part, optional: true

  def self.inheritance_column
    nil
  end
end
