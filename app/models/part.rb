# frozen_string_literal: true

# An question part, part of a question.
class Part < ApplicationRecord
  belongs_to :question

  has_many :body_items, dependent: :destroy
  has_many :references, dependent: :destroy
end
