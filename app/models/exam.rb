# frozen_string_literal: true

# An exam for a course.
class Exam < ApplicationRecord
  belongs_to :course

  has_many :rooms, dependent: :destroy
  has_many :exam_versions, -> { order(:created_at) }, dependent: :destroy, inverse_of: :exam
  has_many :proctor_registrations, dependent: :destroy
  has_many :exam_announcements, dependent: :destroy

  has_many :registrations, -> { unscope(:order) }, through: :exam_versions
  has_many :grading_locks, through: :registrations
  has_many :messages, through: :registrations
  has_many :student_questions, through: :registrations
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
  validate :versions_valid_times

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
    proctor_registrations.exists?(user:)
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
      reason:,
    }
  end

  def checklist_warning(reason)
    {
      status: :warning,
      reason:,
    }
  end

  def checklist_not_started(reason)
    {
      status: :not_started,
      reason:,
    }
  end

  def checklist_na(reason)
    {
      status: :na,
      reason:,
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
    elsif registrations.all?(&:room_id)
      total = registrations.length
      checklist_complete "All registered students (#{total}) have assigned rooms."
    elsif registrations.none?(&:room_id)
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

  def timing_checklist
    if exam_versions.blank?
      checklist_na 'There are no versions yet.'
    elsif exam_versions.all?(&:customized_time?)
      checklist_complete 'All exam versions have defined timing'
    elsif exam_versions.any?(&:customized_time?)
      checklist_warning 'Exam versions do not all define timing'
    else
      checklist_na 'All exam versions use the exam timing'
    end
  end

  def checklist
    {
      rooms: room_checklist,
      timing: timing_checklist,
      staff: staff_checklist,
      seating: seating_checklist,
      versions: versions_checklist,
    }
  end

  def initialize_grading_locks!(reset: false)
    pairs_by_version = exam_versions.to_h { |v| [v.id, v.qp_pairs] }
    GradingLock.transaction do
      existing = GradingLock.where(registration: registrations).includes(:question, :part)
      existing.update(grader: nil) if reset
      existing = existing.group_by(&:registration_id)
      to_be_created = []
      registrations.includes(:exam_version).final.each do |registration|
        existing_for_reg = existing[registration.id] || []
        existing_pairs = existing_for_reg.map { |gl| { question: gl.question, part: gl.part } }
        existing_pairs = existing_pairs.to_set
        missing = pairs_by_version[registration.exam_version_id].reject { |qp| existing_pairs.member? qp }
        new_locks = missing.map do |qp|
          { registration:, question: qp[:question], part: qp[:part] }
        end
        # For safety's sake, validate these new locks
        # No need to validate the uniqueness criterion, since we're specifically
        # creating only the missing grading_locks inside of a transaction
        new_locks.each do |l|
          GradingLock.new(l).validate!(:bulk_create)
          to_be_created << { registration_id: l[:registration].id, question_id: l[:question].id, part_id: l[:part].id }
        end
      end
      # NOTE: skipping validations here is fine, because we checked them above
      # rubocop: disable Rails/SkipsModelValidations
      if to_be_created.present?
        GradingLock
          .create_with(created_at: DateTime.now, updated_at: DateTime.now)
          .insert_all(to_be_created, returning: false)
      end
      # rubocop: enable Rails/SkipsModelValidations
    end
  end

  def finalize_registrations_that_have_run_out_of_time!
    Registration.transaction do
      to_be_finalized = registrations.includes(
        :accommodation,
        :user,
        exam_version: { exam: { course: [:students] } },
      ).in_progress.filter(&:over?)
      # NOTE: skipping validation is safe here, since end_times have no validations associated with them
      # and making this a single query instead of O(#students) is a big win
      # rubocop: disable Rails/SkipsModelValidations
      Registration.where(id: to_be_finalized.map(&:id)).update_all(end_time: DateTime.now)
      # rubocop: enable Rails/SkipsModelValidations
    end
  end

  def visible_to?(check_user, role_for_exam, role_for_course)
    if ([role_for_exam, role_for_course].max >= Exam.roles[:staff]) ||
       all_staff.exists?(check_user.id)
      return true
    end
    unless ([role_for_exam, role_for_course].max == Exam.roles[:student]) ||
           student_ids.member?(check_user.id)
      return false
    end

    reg = registrations.find_by(user: check_user)
    reg&.available? || reg&.over?
  end

  def bottlenose_exam_summary(regs = nil)
    regs = registrations if regs.nil?
    versions_to_use = exam_versions.where(id: regs.to_set(&:exam_version_id))
    if versions_to_use.count == 1
      versions_to_use.first.bottlenose_summary
    else
      all_versions = versions_to_use.map { |ev| ev.bottlenose_summary(with_names: false) }
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
    if regs.nil?
      regs = registrations.includes(
        :most_recent_snapshot,
        :user,
        exam_version: { rubrics: ExamVersion.rubric_includes },
      )
    end
    versions = regs.to_set(&:exam_version)
    versions.each(&:cache_grading_info!)
    versions.each(&:cache_default_answers!)
    default_answers = versions.to_h { |v| [v.id, v.default_answers] }
    regs = regs.reject { |r| r.current_answers == default_answers[r.exam_version_id] }
    all_versions = versions.map { |ev| ev.bottlenose_summary(with_names: false) }
    if compatible_versions(all_versions)
      regs.to_h do |r|
        [
          r.user.username,
          r.current_part_scores,
        ]
      end
    else
      regs.to_h do |r|
        [
          r.user.username,
          [r.current_score_percentage],
        ]
      end
    end
  end

  def compatible_versions(all_versions)
    first_version = all_versions.pop
    all_versions.all? { |v| v == first_version }
  end

  def bottlenose_export
    summary = bottlenose_exam_summary
    grades = bottlenose_exam_grades
    {
      'name' => name,
      'exam_id' => bottlenose_assignment_id,
      'finish_time' => end_time.iso8601,
      'exam_summary' => summary,
      'exam_grades' => grades,
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

  def versions_valid_times
    return if new_record?

    exam_versions.each do |ev|
      if ev.effective_end_time <= ev.effective_start_time || ev.effective_duration > ev.effective_time_window
        errors.add(:base, 'Ensure that the times for this exam are valid for all exam versions')
        break
      end
    end
  end
end
