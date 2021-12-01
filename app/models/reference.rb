# frozen_string_literal: true

# A file reference for an exam version, question, or part.
class Reference < ApplicationRecord
  belongs_to :exam_version, inverse_of: :db_references
  belongs_to :question, optional: true, inverse_of: :references
  belongs_to :part, optional: true, inverse_of: :references

  validate :valid_path
  validate :not_both_question_and_part

  def valid_path
    return if exam_version.has_file_or_dir_path? path

    if exam_version.files.blank?
      errors.add(:base, 'Exam version has references, but no files were given.')
      return
    end

    location = "question #{question.index}" unless question.nil?
    location = "question #{part.question.index}, part #{part.index}" unless part.nil?
    location = 'exam version' if question.nil? && part.nil?
    errors.add(:path, "does not exist in the upload: '#{path}' (invalid reference for #{location})")
  end

  def not_both_question_and_part
    return unless question.present? && part.present?

    errors.add(:base, 'Reference cannot belong to both a question and a part.')
  end

  def contents
    all_files = exam_version.files
    path_components = path.split('/')
    path_components.each do |pc|
      break if all_files.nil?
      
      all_files = all_files['nodes'] if all_files.is_a? Hash
      all_files = all_files.find { |f| f['path'] == pc }
    end
    all_files
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
