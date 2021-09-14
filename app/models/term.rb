# frozen_string_literal: true

class Term < ApplicationRecord
  has_many :courses, dependent: :destroy
  enum semester: { fall: 10, spring: 30, summer_1: 40, summer: 50, summer_2: 60 }

  has_many :registrations, through: :courses
  has_many :staff_registrations, through: :courses
  has_many :proctor_registrations, through: :courses
  has_many :professor_course_registrations, through: :courses

  scope :active, -> { where(archived: false) }
  scope :sorted, -> { sort_by {|tt| tt.canonical_name }.reverse }

  validates :semester, inclusion: {in: Term.semesters.keys},
            uniqueness: {
              scope: :year,
              message: ->(object, data) do
                "Terms must be unique, but the semester/year pair <code>#{object.name}</code> already exists"
              end}

  def canonical_name
    season = "#{Term.semesters[semester]}_#{semester}"

    arch = archived? ? "a" : "z"

    "#{arch} #{effective_year} #{season} #{name}"
  end

  def name
    "#{semester.humanize} #{year}"
  end

  private

  def effective_year
    # Fall is part of numerically-next *academic* year
    add = Term.semesters[semester] < Term.semesters[:spring] ? 1 : 0
    year + add
  end
end
