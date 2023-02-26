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
    @exam.initialize_grading_locks!
  end

  STATIC_GRAPHQL_QUERIES['REQUEST_LOCK_MUTATION'] = <<-GRAPHQL
    mutation requestLock($input: RequestGradingLockInput!) {
      requestGradingLock(input: $input) {
        acquired
        currentOwner { displayName }
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

  def attempt_lock(user, reg, qnum, pnum, raw: false)
    ans = HourglassSchema.do_mutation!('REQUEST_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
    })
    return ans if raw
    assert_not ans['errors']
    return ans['data']['requestGradingLock']
  end

  def attempt_unlock(user, reg, qnum, pnum, complete, raw: false)
    ans = HourglassSchema.do_mutation!('RELEASE_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
      markComplete: complete,
    })
    return ans if raw
    assert_not ans['errors']
    return ans['data']['releaseGradingLock']
  end

  def attempt_unlock_all(user, exam, raw: false)
    ans = HourglassSchema.do_mutation!('RELEASE_ALL_LOCKS_MUTATION', user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
    return ans if raw
    assert_not ans['errors']
    return ans['data']['releaseAllLocks']
  end

  def locks_for(reg)
    reg.grading_locks
       .includes(:question, :part)
       .group_by{ |l| [l.question.index, l.part.index] }
  end

  def lock_for(reg, qnum, pnum)
    locks_for(reg).dig([qnum, pnum], 0)
  end

  test 'acquiring a lock' do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
  end

  test 'cannot reacquire a lock' do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert_not res['acquired']
    assert_equal @ta.display_name, res['currentOwner']['displayName']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
  end

  test 'cannot acquire a lock for a locked part' do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    res = attempt_lock(@grader, @student_reg1, qnum, pnum)
    assert_not res['acquired']
    assert_equal @ta.display_name, res['currentOwner']['displayName']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
  end

  test 'releasing a lock' do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
    res = attempt_unlock(@ta, @student_reg1, qnum, pnum, true)
    assert res['released']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.completed_by
  end

  test "grader cannot release another grader's lock" do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader

    res = attempt_unlock(@grader, @student_reg1, qnum, pnum, true, raw: true)
    assert_not res['errors'].empty?
    assert_match(/do not have permission/, res['errors'][0]['message'])
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
    assert_nil lock.completed_by
  end

  test 'professor can release a lock belonging to a grader' do
    qnum, pnum = [0, 0]
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader

    res = attempt_unlock(@prof, @student_reg1, qnum, pnum, false)
    assert_not res['errors']
    assert res['released']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_nil lock.completed_by
    assert_nil lock.grader
  end

  test 'release multiple locks' do
    assert 5, @exam.grading_locks.length
    res = attempt_unlock_all(@prof, @exam, raw: true)
    assert_not res['errors']
    assert res['data']['releaseAllGradingLocks']['released']
    @exam.reload
    assert 0, @exam.grading_locks.length
  end
end
