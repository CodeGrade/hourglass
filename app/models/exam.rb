# frozen_string_literal: true

# An exam for a course.
class Exam < ApplicationRecord
  belongs_to :course

  has_many :rooms, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_many :exam_versions, dependent: :destroy
  has_many :proctor_registrations, dependent: :destroy
  has_many :exam_announcements, dependent: :destroy

  has_many :registrations, through: :exam_versions
  has_many :grading_locks, through: :registrations
  has_many :accommodations, through: :registrations
  has_many :version_announcements, through: :exam_versions
  has_many :room_announcements, through: :rooms
  has_many :anomalies, through: :registrations

  validates :course, presence: true
  validates :name, presence: true
  validates :duration, presence: true, numericality: {
    only_integer: true,
  }

  validate :end_after_start
  validate :duration_valid

  delegate :professors, to: :course

  def duration
    self[:duration].seconds
  end

  def finalize_registrations_that_have_run_out_of_time!
    registrations.in_progress.each do |r|
      r.finalize! if r.over?
    end
  end

  def finalized_registrations
    registrations.final
  end

  def finalized?
    registrations.in_progress.empty?
  end

  def finalize!
    exam_versions.map(&:finalize!)
  end

  def students
    User.where(id: registrations.select(:user_id))
  end

  def unassigned_students
    student_regs_by_id = registrations.group_by(&:user_id)
    course.students.reject do |s|
      student_regs_by_id.has_key? s.id
    end
  end

  def registrations_without_rooms
    registrations.where(room: nil)
  end

  def proctor_registrations_without_rooms
    proctor_registrations.where(room: nil)
  end

  def rooms_without_staff
    rooms.reject(&:has_staff?)
  end

  def unassigned_staff
    proctor_regs_by_id = proctor_registrations.group_by(&:user_id)
    course.staff.reject do |s|
      proctor_regs_by_id.has_key? s.id
    end
  end

  def time_window
    (end_time - start_time).seconds
  end

  def room_checklist
    if rooms.blank?
      checklist_not_started 'No rooms have been created for this exam.'
    else
      count = rooms.length
      checklist_complete "#{count} #{'room'.pluralize(count)}"
    end
  end

  # No rooms: NA
  # No rooms have staff and staff exist: NOT_STARTED
  # Some rooms have staff and some do not: WARNING
  # All rooms have staff OR no staff exist: COMPLETE
  def staff_checklist
    if rooms.blank?
      checklist_na 'No rooms created for this exam.'
    elsif course.has_staff? && rooms.none?(&:has_staff?)
      checklist_not_started 'No rooms have proctors assigned.'
    elsif course.has_staff? && !rooms.all?(&:has_staff?)
      missing = rooms_without_staff.length
      total = rooms.length
      checklist_warning "Some rooms (#{missing}/#{total}) have no proctors."
    else
      checklist_complete 'All rooms have staff assigned.'
    end
  end

  # No rooms: NA
  # All students have rooms: COMPLETE
  # All students have nil rooms: NOT_STARTED
  # Some students have nil rooms: WARNING
  def seating_checklist
    if rooms.blank?
      checklist_na 'No rooms created for this exam.'
    elsif registrations.blank?
      checklist_not_started 'No registered students for this exam.'
    elsif registrations.all?(&:room)
      total = registrations.length
      checklist_complete "All registered students (#{total}) have assigned rooms."
    elsif registrations.none?(&:room)
      checklist_not_started 'Students have not been assigned seating.'
    else
      missing = registrations_without_rooms.length
      total = students.length
      checklist_warning "Some registered students (#{missing}/#{total}) have not been assigned seats."
    end
  end

  # No registrations: NOT_STARTED
  # regs.count != students.count: WARNING
  # regs.count == students.count: COMPLETE
  def versions_checklist
    if course.students.blank?
      checklist_na 'This course has no students.'
    elsif registrations.blank?
      checklist_not_started 'No students have versions assigned.'
    elsif registrations.length != course.students.length
      total = course.students.length
      missing = unassigned_students.length
      checklist_warning "Some students (#{missing}/#{total}) have not been registered for an exam version."
    else
      total = registrations.length
      checklist_complete "All students (#{total}) have exam versions assigned."
    end
  end

  def checklist
    {
      rooms: room_checklist,
      staff: staff_checklist,
      seating: seating_checklist,
      versions: versions_checklist,
    }
  end

  def message_recipients
    {
      students: direct_recipients,
      versions: version_recipients,
      rooms: room_recipients,
    }
  end

  private

  def direct_recipients
    students.order(:display_name).map do |s|
      {
        id: s.id,
        name: s.display_name,
      }
    end
  end

  def version_recipients
    exam_versions.order(:name).map do |ev|
      {
        id: ev.id,
        name: ev.name,
      }
    end
  end

  def room_recipients
    rooms.order(:name).map do |room|
      {
        id: room.id,
        name: room.name,
      }
    end
  end

  def checklist_complete(reason)
    {
      status: 'COMPLETE',
      reason: reason,
    }
  end

  def checklist_warning(reason)
    {
      status: 'WARNING',
      reason: reason,
    }
  end

  def checklist_not_started(reason)
    {
      status: 'NOT_STARTED',
      reason: reason,
    }
  end

  def checklist_na(reason)
    {
      status: 'NA',
      reason: reason,
    }
  end

  def duration_valid
    return unless duration > time_window

    errors.add(:duration, "can't be longer than the duration between start and end times")
  end

  def end_after_start
    return unless end_time <= start_time

    errors.add(:end_time, 'must be later than start time')
  end
end
