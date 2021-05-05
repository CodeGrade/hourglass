# frozen_string_literal: true

# A file reference for an exam version, question, or part.
class Reference < ApplicationRecord
  belongs_to :exam_version, inverse_of: :db_references
  belongs_to :question, optional: true, inverse_of: :references
  belongs_to :part, optional: true, inverse_of: :references

  def self.inheritance_column
    nil
  end

  def as_json
    { type => path }
  end
end
