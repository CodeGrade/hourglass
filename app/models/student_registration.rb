# frozen_string_literal: true

# Registrations for students to a section.
class StudentRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  has_one :course, through: :section

  def course
    super || section.try(:course)
  end
end
