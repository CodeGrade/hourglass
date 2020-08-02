# frozen_string_literal: true

class RubricPreset < ApplicationRecord
  belongs_to :rubric
  has_many :preset_comments, dependent: :destroy
end
