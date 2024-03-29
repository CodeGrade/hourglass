# frozen_string_literal: true

# A course taken by students that gives exams.
class Course < ApplicationRecord
  belongs_to :term

  has_many :exams, dependent: :destroy
  has_many :sections, dependent: :destroy

  has_many :professor_course_registrations, dependent: :destroy
  has_many :staff_registrations, through: :sections
  has_many :student_registrations, through: :sections
  has_many :registrations, through: :exams
  has_many :proctor_registrations, through: :exams

  has_many :student_ids, -> { distinct }, through: :student_registrations
  has_many :staff_ids, -> { distinct }, through: :staff_registrations
  has_many :professor_ids, -> { distinct }, through: :professor_course_registrations

  has_many :students, -> { distinct }, through: :student_registrations, source: :user
  has_many :staff, -> { distinct }, through: :staff_registrations, source: :user
  has_many :professors, -> { distinct }, through: :professor_course_registrations, source: :user

  validates :title, presence: true
  validates :bottlenose_id, presence: true

  def user_is_student?(user)
    student_registrations.exists?(user: user)
  end

  def user_is_staff?(user)
    staff_registrations.exists?(user: user)
  end

  def user_is_professor?(user)
    professor_course_registrations.exists?(user: user)
  end

  def all_staff
    User.where(id: staff_ids + professor_ids)
  end

  def all_users
    User.where(id: staff_ids + professor_ids + student_ids)
  end

  def has_staff?
    staff_registrations.exists?
  end

  def user_member?(check_user)
    all_users.exists? check_user.id
  end

  def visible_to?(check_user, _role_for_exam, role_for_course)
    (role_for_course >= Exam.roles[:staff]) || all_staff.exists?(check_user.id)
  end
end
