# frozen_string_literal: true

# An question part, part of a question.
class Part < ApplicationRecord
  belongs_to :question

  has_many :body_items, dependent: :destroy
  has_many :references, dependent: :destroy
  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  delegate :visible_to?, to: :question
  delegate :course, to: :question
end
