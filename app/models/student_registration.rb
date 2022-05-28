# frozen_string_literal: true

# Registrations for students to a section.
class StudentRegistration < ApplicationRecord
  belongs_to :section
  belongs_to :user

  delegate :course, to: :section
end
