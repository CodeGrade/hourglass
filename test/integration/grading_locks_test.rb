# frozen_string_literal: true

require 'test_helper'

class GradingLocksTest < ActionDispatch::IntegrationTest
  def setup
    @course = create(:course)
    @prof_reg = create(:professor_course_registration, course: @course)
    @prof = @prof_reg.user
    @section = create(:section, course: @course)
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, :with_finished_submissions, exam: @exam)
    @student_reg1 = @exam.registrations.first
    @ta_reg = create(:staff_registration, :ta, section: @section)
    @ta = @ta_reg.user
    @grader_reg = create(:staff_registration, section: @section)
    @grader = @grader_reg.user
  end

  STATIC_GRAPHQL_QUERIES['ACQUIRE_LOCK_MUTATION'] = <<-GRAPHQL
    mutation acquireLock($input: AcquireGradingLockInput!) {
      acquireGradingLock(input: $input) {
        acquired
      }
    }
  GRAPHQL

  STATIC_GRAPHQL_QUERIES['RELEASE_LOCK_MUTATION'] = <<-GRAPHQL
    mutation releaseLock($input: ReleaseGradingLockInput!) {
      releaseGradingLock(input: $input) {
        released
      }
    }
  GRAPHQL

  STATIC_GRAPHQL_QUERIES['RELEASE_ALL_LOCKS_MUTATION'] = <<-GRAPHQL
    mutation releaseAllLocks($input: ReleaseAllGradingLocksInput!) {
      releaseAllGradingLocks(input: $input) {
        released
      }
    }
  GRAPHQL

  def attempt_lock(user, reg, qnum, pnum)
    HourglassSchema.do_mutation!('ACQUIRE_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
    })
  end

  def attempt_unlock(user, reg, qnum, pnum, complete)
    HourglassSchema.do_mutation!('RELEASE_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
      markComplete: complete,
    })
  end

  def attempt_unlock_all(user, exam)
    HourglassSchema.do_mutation!('RELEASE_ALL_LOCKS_MUTATION', user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
  end

  test 'acquiring a lock' do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'cannot reacquire a lock' do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors'].empty?
    assert_match(/already being graded/, res['errors'][0]['message'])
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'cannot acquire a lock for a locked part' do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    res = attempt_lock(@grader, @student_reg1, 0, 0)
    assert_not res['errors'].empty?
    assert_match(/already being graded/, res['errors'][0]['message'])
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'releasing a lock' do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader
    res = attempt_unlock(@ta, @student_reg1, 0, 0, true)
    assert_not res['errors']
    assert res['data']['releaseGradingLock']['released']
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.completed_by
  end

  test "grader cannot release another grader's lock" do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader

    res = attempt_unlock(@grader, @student_reg1, 0, 0, true)
    assert_not res['errors'].empty?
    assert_match(/do not have permission/, res['errors'][0]['message'])
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_nil @student_reg1.grading_locks.first.completed_by
  end

  test 'professor can release a lock belonging to a grader' do
    res = attempt_lock(@ta, @student_reg1, 0, 0)
    assert_not res['errors']
    assert res['data']['acquireGradingLock']['acquired']
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader

    res = attempt_unlock(@prof, @student_reg1, 0, 0, false)
    assert_not res['errors']
    assert res['data']['releaseGradingLock']['released']
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_nil @student_reg1.grading_locks.first.completed_by
    assert_nil @student_reg1.grading_locks.first.grader
  end

  test 'release multiple locks' do
    create(:grading_lock, registration: @student_reg1, grader: @grader)
    create(:grading_lock, registration: @student_reg1, grader: @ta, pnum: 1)
    assert 2, @exam.grading_locks.length
    res = attempt_unlock_all(@prof, @exam)
    assert_not res['errors']
    assert res['data']['releaseAllGradingLocks']['released']
    @exam.reload
    assert 0, @exam.grading_locks.length
  end
end
