# frozen_string_literal: true

# Questions from students during an exam.
class StudentQuestion < ApplicationRecord
  belongs_to :registration

  has_one :exam, through: :registration
  has_one :user, through: :registration
  delegate :proctors_and_professors, to: :exam

  def user
    super || registration.try(:user)
  end

  def exam
    super || registation.try(:exam)
  end

  validates :body, presence: true, length: { maximum: 2000 }

  def visible_to?(check_user, role_for_exam, _role_for_course)
    (user == check_user) ||
      (role_for_exam >= Exam.roles[:proctor]) ||
      proctors_and_professors.exists?(check_user.id)
  end
end
