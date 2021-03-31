# frozen_string_literal: true

# An exam question, part of an exam version.
class Question < ApplicationRecord
  belongs_to :exam_version

  has_many :parts, dependent: :destroy
  has_many :references, dependent: :destroy
end
