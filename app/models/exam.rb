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

  has_many :student_ids, -> { distinct }, through: :registrations
  has_many :proctor_ids, -> { distinct }, through: :proctor_registrations
  delegate :professor_ids, to: :course

  has_many :students, -> { distinct }, through: :registrations, source: :user
  has_many :proctors, -> { distinct }, through: :proctor_registrations, source: :user
  delegate :professors, to: :course
  delegate :all_staff, to: :course

  delegate :user_is_student?, to: :course
  delegate :user_is_staff?, to: :course
  delegate :user_is_professor?, to: :course

  validates :course, presence: true
  validates :name, presence: true
  validates :duration, presence: true, numericality: {
    only_integer: true,
  }

  enum role: {
    no_reg: 0,
    student: 1,
    staff: 2,
    proctor: 3,
    professor: 4,
  }

  validate :end_after_start
  validate :duration_valid

  def graded
    finalized? && grading_locks.incomplete.none?
  end

  def duration
    self[:duration].seconds
  end

  def finalized?
    registrations.in_progress.empty?
  end

  def finalize!
    exam_versions.map(&:finalize!)
  end

  def proctors_and_professors
    User.where(id: proctor_ids + professor_ids)
  end

  def user_is_proctor?(user)
    proctor_registrations.where(user: user).exists?
  end

  # All students and proctors registered for the exam.
  def all_registered_users
    User.where(id: student_ids + proctor_ids)
  end

  def everyone
    User.where(id: student_ids + proctor_ids + professor_ids)
  end

  def unassigned_students
    student_regs_by_id = registrations.group_by(&:user_id)
    course.students.order(display_name: :asc).reject do |s|
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
    course.staff.order(display_name: :asc).reject do |s|
      proctor_regs_by_id.key? s.id
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

  def visible_to?(check_user, role_for_exam, role_for_course)
    if ([role_for_exam, role_for_course].max >= Exam.roles[:proctor]) ||
       proctors_and_professors.exists?(check_user.id)
      return true
    end
    unless ([role_for_exam, role_for_course].max == Exam.roles[:student]) ||
           student_ids.member?(check_user.id)
      return false
    end

    reg = registrations.find_by(user: check_user)
    reg.available? || reg.over?
  end

  def bottlenose_exam_summary
    if exam_versions.count == 1
      exam_versions.first.bottlenose_summary
    else
      all_versions = exam_versions.map{ |ev| ev.bottlenose_summary(false) }
      if compatible_versions(all_versions)
        all_versions.first
      else
        [{
          'name' => 'Final grade',
          'weight' => 100,
        }]
      end
    end
  end

  def bottlenose_exam_grades(regs = nil)
    regs = registrations if regs.nil?
    all_versions = exam_versions.map{ |ev| ev.bottlenose_summary(false) }
    if compatible_versions(all_versions)
      regs.map do |r|
        [
          r.user.username,
          r.current_part_scores,
        ]
      end.to_h
    else
      regs.map do |r|
        [
          r.user.username,
          [r.current_score],
        ]
      end.to_h
    end
  end

  def compatible_versions(all_versions)
    first_version = all_versions.pop
    all_versions.all? { |v| v == first_version }
  end
  def bottlenose_export
    {
      'name' => name,
      'exam_id' => bottlenose_assignment_id,
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
