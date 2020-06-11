# frozen_string_literal: true

# An exam for a course.
class Exam < ApplicationRecord
  belongs_to :course

  has_many :rooms, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_many :exam_versions, dependent: :destroy

  has_many :registrations, through: :rooms
  has_many :proctor_registrations, through: :rooms

  validates :course, presence: true
  validates :name, presence: true
  validates :duration, presence: true, numericality: {
    only_integer: true
  }

  validate :time_checks

  def duration
    self[:duration].seconds
  end

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    rooms.map(&:finalize!)
  end

  def professors
    registrations.includes(:user).where(role: 'professor').map(&:user)
  end

  def students
    registrations.includes(:user).where(role: 'student').map(&:user)
  end

  def unassigned_students
    course.students.reject do |s|
      registrations.exists? user: s
    end
  end

  def unassigned_staff
    course.staff.reject do |s|
      proctor_registrations.exists? user: s
    end
  end

  def time_window
    (end_time - start_time).seconds
  end

  private

  def time_checks
    return unless duration > time_window

    errors.add(:duration, "can't be longer than the duration between start and end times")
  end
end
