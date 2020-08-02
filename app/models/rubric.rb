# frozen_string_literal: true

class Rubric < ApplicationRecord

  belongs_to :exam_version
  belongs_to :parent_section,
             class_name: 'Rubric',
             foreign_key: 'parent_section_id', 
             inverse_of: 'subsections',
             optional: true

  has_many :subsections,
           class_name: 'Rubric',
           foreign_key: 'parent_section_id',
           inverse_of: 'parent_section',
           dependent: :destroy

  has_many :rubric_presets, dependent: :destroy

end