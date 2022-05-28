# frozen_string_literal: true

# Special accommodations for a student's exam.
# Extra time / alternate start times.
class Accommodation < ApplicationRecord
  belongs_to :registration

  validates :registration, uniqueness: { message: 'already has an accommodation' }
  validates :percent_time_expansion, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 0,
  }

  delegate :user, to: :registration
  delegate :exam, to: :registration
  delegate :exam_version, to: :registration
  delegate :course, to: :exam

  def factor
    (percent_time_expansion.to_f / 100.0) + 1.0
  end

  def visible_to?(check_user, role_for_exam, _role_for_course)
    (role_for_exam >= Exam.roles[:professor]) || course.professors.exists?(check_user.id)
  end
end
