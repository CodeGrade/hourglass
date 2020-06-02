# frozen_string_literal: true

# A course taken by students that gives exams.
class Course < ApplicationRecord
  has_many :exams, dependent: :destroy
  has_many :sections, dependent: :destroy

  has_many :professor_course_registrations, dependent: :destroy
  has_many :student_registrations, through: :sections

  validates :title, presence: true
  validates :bottlenose_id, presence: true

  def students
    student_registrations.select(:user_id).distinct.map(&:user)
  end
end
