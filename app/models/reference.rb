# frozen_string_literal: true

# A file reference for an exam version, question, or part.
class Reference < ApplicationRecord
  belongs_to :exam_version, inverse_of: :db_references
  belongs_to :question, optional: true, inverse_of: :references
  belongs_to :part, optional: true, inverse_of: :references

  validate :valid_path

  def valid_path
    return if exam_version.has_file_or_dir_path? path

    location = "question #{question.index}" unless question.nil?
    location = "question #{part.question.index}, part #{part.index}" unless part.nil?
    location = 'exam version' if question.nil? && part.nil?
    errors.add(:path, "does not exist in the upload: '#{path}' (invalid reference for #{location})")
  end

  def self.inheritance_column
    nil
  end

  def as_json(format:)
    if format == :graphql
      {
        type: type,
        path: path,
      }
    else
      { type => path }
    end
  end
end
