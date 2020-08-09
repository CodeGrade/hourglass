# frozen_string_literal: true

# Registrations for staff to a section.
class StaffRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  validates :section, presence: true
  validates :user, presence: true

  delegate :course, to: :section
  delegate :professors, to: :course

  def visible_to?(check_user)
    (user == check_user) || professors.exists?(check_user.id)
  end
end
