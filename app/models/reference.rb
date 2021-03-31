# frozen_string_literal: true

# A file reference for an exam version, question, or part.
class Reference < ApplicationRecord
  belongs_to :exam_version
  belongs_to :question
  belongs_to :part

  def self.inheritance_column
    nil
  end
end
