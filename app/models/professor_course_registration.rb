# frozen_string_literal: true

# Registrations for professors to a course.
class ProfessorCourseRegistration < ApplicationRecord
  belongs_to :course
  belongs_to :user

  delegate :professors, to: :course
end
