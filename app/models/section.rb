# frozen_string_literal: true

# A section of a course.
class Section < ApplicationRecord
  belongs_to :course

  has_many :student_registrations, dependent: :destroy
  has_many :staff_registrations, dependent: :destroy

  has_many :students, through: :student_registrations, source: :user
  has_many :staff, through: :staff_registrations, source: :user

  validates :bottlenose_id, presence: true, uniqueness: {
    message: 'id already exists for another record',
  }

  delegate :professors, to: :course
end
