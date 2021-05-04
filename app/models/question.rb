# frozen_string_literal: true

# An exam question, part of an exam version.
class Question < ApplicationRecord
  belongs_to :exam_version

  has_many :parts, dependent: :destroy
  has_many :references, dependent: :destroy
  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :exam_version
  delegate :course, to: :exam_version
end
