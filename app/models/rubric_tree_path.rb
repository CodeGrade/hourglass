# frozen_string_literal: true

# Rubrics in an exam form a tree, whose leaves are RubricPresets
class RubricTreePath < ApplicationRecord
  belongs_to :ancestor, class_name: 'Rubric'
  belongs_to :descendant, class_name: 'Rubric'
end
