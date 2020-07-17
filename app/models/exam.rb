# frozen_string_literal: true

# An exam for a course.
class Exam < ApplicationRecord
  belongs_to :course

  has_many :rooms, dependent: :destroy
  has_many :exam_versions, dependent: :destroy
  has_many :proctor_registrations, dependent: :destroy
  has_many :exam_announcements, dependent: :destroy

  has_many :registrations, through: :exam_versions
  has_many :grading_locks, through: :registrations
  has_many :messages, through: :registrations
  has_many :questions, through: :registrations
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

  def finalized?
    registrations.in_progress.empty?
  end

  def finalize!
    exam_versions.map(&:finalize!)
  end

  def students
    User.where(id: registrations.select(:user_id))
  end

  def proctors
    User.where(id: proctor_registrations.select(:user_id))
  end

  def proctors_and_professors
    proctors.or(professors)
  end

  # All students and proctors registered for the exam.
  def all_registered_users
    students.or(proctors)
  end

  def everyone
    students.or(proctors).or(professors)
  end

  def unassigned_students
    student_regs_by_id = registrations.group_by(&:user_id)
    course.students.reject do |s|
      student_regs_by_id.key? s.id
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

  def checklist_complete(reason)
    {
      status: :complete,
      reason: reason,
    }
  end

  def checklist_warning(reason)
    {
      status: :warning,
      reason: reason,
    }
  end

  def checklist_not_started(reason)
    {
      status: :not_started,
      reason: reason,
    }
  end

  def checklist_na(reason)
    {
      status: :na,
      reason: reason,
    }
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
  # All student have nil rooms: NOT_STARTED
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

  def initialize_grading_locks!(reset = false)
    pairs_by_version = exam_versions.map { |v| [v.id, v.qp_pairs] }.to_h
    GradingLock.transaction do
      GradingLock.where(registration: registrations).update(grader: nil) if reset
      registrations.final.each do |registration|
        pairs_by_version[registration.exam_version_id].each do |qnum, pnum|
          GradingLock.find_or_create_by(registration: registration, qnum: qnum, pnum: pnum)
        end
      end
    end
  end

  def finalize_registrations_that_have_run_out_of_time!
    registrations.in_progress.each do |r|
      r.finalize! if r.over?
    end
  end

  def visible_to?(check_user)
    everyone.exists? check_user.id
  end

  def bottlenose_exam_summary
    if exam_versions.count == 1
      exam_versions.first.bottlenose_summary
    else
      [{
        'name' => 'Final grade',
        'weight' => 100,
      }]
    end
  end

  def bottlenose_exam_grades
    if exam_versions.count == 1
      registrations.map do |r|
        [
          r.user.username,
          r.current_part_scores,
        ]
      end.to_h
    else
      registrations.map do |r|
        [
          r.user.username,
          [r.current_score],
        ]
      end.to_h
    end
  end

  def bottlenose_export
    {
      'name' => name,
      'finish_time' => end_time.iso8601,
      'exam_summary' => bottlenose_exam_summary,
      'exam_grades' => bottlenose_exam_grades,
    }
  end

  private

  def duration_valid
    return unless duration > time_window

    mins = (time_window / 60.0).to_i
    errors.add(:duration, "can't be longer than the duration between start and end times (#{mins} minutes)")
  end

  def end_after_start
    return unless end_time <= start_time

    errors.add(:end_time, 'must be later than start time')
  end
end
