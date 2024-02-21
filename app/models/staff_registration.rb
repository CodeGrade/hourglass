# frozen_string_literal: true

# Registrations for staff to a section.
class StaffRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  has_one :course, through: :section
  delegate :professors, to: :course

  def course
    super || section.try(:course)
  end

  def visible_to?(check_user, role_for_exam, role_for_course)
    (user == check_user) ||
      ([role_for_exam, role_for_course].max >= Exam.roles[:professor]) ||
      professors.exists?(check_user.id)
  end
end
