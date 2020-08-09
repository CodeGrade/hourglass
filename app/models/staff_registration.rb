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
    (user.id == check_user.id) || professors.exists?(check_user.id)
  end
end
