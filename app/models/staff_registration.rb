# frozen_string_literal: true

# Registrations for staff to a section.
class StaffRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  delegate :course, to: :section
  delegate :professors, to: :course

  def visible_to?(check_user, role_for_exam, role_for_course)
    (user == check_user) ||
      ([role_for_exam, role_for_course].max >= Exam.roles[:professor]) ||
      professors.exists?(check_user.id)
  end
end
