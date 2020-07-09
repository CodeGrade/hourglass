# frozen_string_literal: true

# A course taken by students that gives exams.
class Course < ApplicationRecord
  has_many :exams, dependent: :destroy
  has_many :sections, dependent: :destroy

  has_many :professor_course_registrations, dependent: :destroy
  has_many :staff_registrations, through: :sections
  has_many :student_registrations, through: :sections

  validates :title, presence: true
  validates :bottlenose_id, presence: true

  def students
    User.where(id: student_registrations.select(:user_id))
  end

  def staff
    User.where(id: staff_registrations.select(:user_id))
  end

  def professors
    User.where(id: professor_course_registrations.select(:user_id))
  end

  def all_staff
    staff.or(professors)
  end

  def all_users
    students.or(staff).or(professors)
  end

  def has_staff?
    staff_registrations.exists?
  end

  def user_member?(check_user)
    all_users.exists? check_user.id
  end

  def visible_to?(check_user)
    professors.exists? check_user.id
  end
end
