# frozen_string_literal: true

class Term < ApplicationRecord
  has_many :courses, dependent: :destroy
  enum semester: { fall: 10, spring: 30, summer_1: 40, summer: 50, summer_2: 60 }

  has_many :registrations, through: :courses
  has_many :staff_registrations, through: :courses
  has_many :proctor_registrations, through: :courses
  has_many :professor_course_registrations, through: :courses

  scope :active, -> { where(archived: false) }

  validates :semester, inclusion: {in: Term.semesters.keys},
            uniqueness: {
              scope: :year,
              message: ->(object, data) do
                "Terms must be unique, but the semester/year pair <code>#{object.name}</code> already exists"
              end}

  def name
    "#{semester.humanize} #{year}"
  end
end
