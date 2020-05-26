# frozen_string_literal: true

# A section of a course.
class Section < ApplicationRecord
  belongs_to :course

  has_many :student_registrations, dependent: :destroy
  has_many :staff_registrations, dependent: :destroy

  has_many :users, through: :section_registrations

  validates :course, presence: true
end
