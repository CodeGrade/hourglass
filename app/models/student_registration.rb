# frozen_string_literal: true

# Registrations for students to a section.
class StudentRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  validates :section, presence: true
  validates :user, presence: true

  delegate :course, to: :section
end
