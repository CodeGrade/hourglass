# frozen_string_literal: true

# A section of a course.
class Section < ApplicationRecord
  belongs_to :course

  has_many :student_registrations, dependent: :destroy
  has_many :staff_registrations, dependent: :destroy

  has_many :students, through: :student_registrations, source: :user
  has_many :staff, through: :staff_registrations, source: :user

  validates :course, presence: true

  def registered_students_for(exam)
    exam.registrations.where(user: students).includes(:user).map(&:user)
  end
end
