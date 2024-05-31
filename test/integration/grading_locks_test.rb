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
    @ta2_reg = create(:staff_registration, :ta, section: @section)
    @ta2 = @ta2_reg.user
    @grader_reg = create(:staff_registration, section: @section)
    @grader = @grader_reg.user
    @exam.initialize_grading_locks!
    @qps = @version.qp_pairs.map {|qp| [qp[:qnum], qp[:pnum], qp[:question], qp[:part]] }
  end

  STATIC_GRAPHQL_QUERIES['REQUEST_LOCK_MUTATION'] = <<-GRAPHQL
    mutation requestLock($input: RequestGradingLockInput!) {
      requestGradingLock(input: $input) {
        acquired
        currentOwner { displayName }
      }
    }
  GRAPHQL

  STATIC_GRAPHQL_QUERIES['POSTPONE_LOCK_MUTATION'] = <<-GRAPHQL
    mutation postponeLock($input: PostponeGradingLockInput!) {
      postponeGradingLock(input: $input) {
        released
        gradingLock { grader { displayName } }
      }
    }
  GRAPHQL

  STATIC_GRAPHQL_QUERIES['GRADE_NEXT_MUTATION'] = <<-GRAPHQL
    mutation gradeNext($input: GradeNextInput!) {
      gradeNext(input: $input) {
        registrationId
        qnum
        pnum
        notes
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

  def attempt_lock(user, reg, qnum, pnum, steal: false, raw: false)
    ans = HourglassSchema.do_mutation!('REQUEST_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
      steal: steal
    })
    return ans if raw

    assert_not ans['errors']
    ans['data']['requestGradingLock']
  end

  # rubocop:disable Metrics/ParameterLists
  def attempt_postpone(user, reg, qnum, pnum, notes, raw: false)
    ans = HourglassSchema.do_mutation!('POSTPONE_LOCK_MUTATION', user, {
      registrationId: HourglassSchema.id_from_object(reg, Types::RegistrationType, {}),
      qnum: qnum,
      pnum: pnum,
      notes: notes
    })
    return ans if raw

    assert_not ans['errors']
    ans['data']['postponeGradingLock']
  end

  def attempt_grade_next(user, reg, qnum, pnum, allow_change_problems: false, raw: false)
    exam_version = reg.exam_version
    exam = exam_version.exam
    ans = HourglassSchema.do_mutation!('GRADE_NEXT_MUTATION', user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
      examVersionId: HourglassSchema.id_from_object(exam_version, Types::ExamVersionType, {}),
      qnum: qnum,
      pnum: pnum,
      allowChangeProblems: allow_change_problems
    })
    return ans if raw

    assert_not ans['errors']
    ans['data']['gradeNext']
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
    ans['data']['releaseGradingLock']
  end
  # rubocop:enable Metrics/ParameterLists

  def attempt_unlock_all(user, exam, raw: false)
    ans = HourglassSchema.do_mutation!('RELEASE_ALL_LOCKS_MUTATION', user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
    return ans if raw

    assert_not ans['errors']
    ans['data']['releaseAllLocks']
  end

  def locks_for(reg)
    reg.grading_locks
       .includes(:question, :part)
       .group_by { |l| [l.question.index, l.part.index] }
  end

  def lock_for(reg, qnum, pnum)
    locks_for(reg).dig([qnum, pnum], 0)
  end

  test 'acquiring a lock' do
    qnum, pnum = @qps.first
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @ta, lock.grader
  end

  test 'stealing a lock as professor' do
    qnum, pnum = @qps.first
    lock = lock_for(@student_reg1, qnum, pnum)
    lock.update(grader: @ta)
    res = attempt_lock(@prof, @student_reg1, qnum, pnum, steal: true)
    assert res['acquired']
    @student_reg1.reload
    lock = lock_for(@student_reg1, qnum, pnum)
    assert_not_nil lock
    assert_equal @prof, lock.grader
  end

  def mark_all_locks_finished
    @exam.grading_locks.update_all(completed_by_id: @prof.id)
  end

  test 'postponing a lock with no notes should fail' do
    qnum, pnum = @qps.first
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    res = attempt_postpone(@ta, @student_reg1, qnum, pnum, nil, raw: true)
    assert_not res['errors'].empty?
    assert_match(/to not be null/, res['errors'][0]['message'])
    res = attempt_postpone(@ta, @student_reg1, qnum, pnum, '', raw: true)
    assert_not res['errors'].empty?
    assert_match(/leave a non-empty note/, res['errors'][0]['message'])
  end

  test 'postponing a lock with non-empty notes should succeed' do
    note = 'not sure what to do'
    qnum, pnum = @qps.first
    res = attempt_lock(@ta, @student_reg1, qnum, pnum)
    assert res['acquired']
    res = attempt_postpone(@ta, @student_reg1, qnum, pnum, note)
    assert_not res['released']
    lock = lock_for(@student_reg1, qnum, pnum)
    lock.reload
    assert note, lock.notes
  end

  test 'acquiring another lock when postponed locks are available, without channging problems' do
    # ensure *almost* everything is finished, already, to focus the grade-next check
    mark_all_locks_finished
    qnum, pnum, q, p = @qps.first
    qp_locks = @exam.grading_locks.where(question: q, part: p)
    qp_locks.update_all(completed_by_id: nil)
    @exam.grading_locks.last.update(completed_by: nil)
    note = 'postponing this lock'
    lock = lock_for(@student_reg1, qnum, pnum)
    lock.update(grader: @ta, notes: note)
    # request more locks, and always get non-postponed ones    
    (1...qp_locks.count).each do
      res = attempt_grade_next(@ta, @student_reg1, qnum, pnum)
      assert res['registrationId']
      new_reg = HourglassSchema.object_from_id(res['registrationId'], {})
      assert_not_equal @student_reg1, new_reg
      assert_equal qnum, res['qnum']
      assert_equal pnum, res['pnum']
      assert res['notes'].blank?
      l = lock_for(new_reg, qnum, pnum)
      l.update(completed_by: @ta, grader: nil)
    end
    # try again, and the only one remaining is the postponed one
    res = attempt_grade_next(@ta, @student_reg1, qnum, pnum)
    assert res['registrationId']
    new_reg = HourglassSchema.object_from_id(res['registrationId'], {})
    assert_equal @student_reg1, new_reg
    assert_equal qnum, res['qnum']
    assert_equal pnum, res['pnum']
    assert_equal note, res['notes']
    lock.update(completed_by: @ta, grader: nil)
    # try one more time (without changing problems) and fail
    res = attempt_grade_next(@ta, @student_reg1, qnum, pnum, raw: true)
    assert_not res['errors'].empty?
    assert_match(/no more submissions/, res['errors'][0]['message'])
  end

  test 'acquiring another lock when postponed locks are available, allowing channging problems' do
    # ensure *almost* everything is finished, already, to focus the grade-next check
    mark_all_locks_finished
    qnum, pnum, q, p = @qps.first
    qp_locks = @exam.grading_locks.where(question: q, part: p)
    qp_locks.update_all(completed_by_id: nil)
    @exam.grading_locks.last.update(completed_by: nil)
    note = 'postponing this lock'
    lock = lock_for(@student_reg1, qnum, pnum)
    lock.update(grader: @ta, notes: note)
    # request more locks, and always get non-postponed ones    
    (1...qp_locks.count).each do
      res = attempt_grade_next(@ta, @student_reg1, qnum, pnum, allow_change_problems: true)
      assert res['registrationId']
      new_reg = HourglassSchema.object_from_id(res['registrationId'], {})
      assert_not_equal @student_reg1, new_reg
      assert_equal qnum, res['qnum']
      assert_equal pnum, res['pnum']
      assert res['notes'].blank?
      l = lock_for(new_reg, qnum, pnum)
      l.update(completed_by: @ta, grader: nil)
    end
    # try again, and the only one remaining is the postponed one
    res = attempt_grade_next(@ta, @student_reg1, qnum, pnum, allow_change_problems: true)
    assert res['registrationId']
    new_reg = HourglassSchema.object_from_id(res['registrationId'], {})
    assert_equal @student_reg1, new_reg
    assert_equal qnum, res['qnum']
    assert_equal pnum, res['pnum']
    assert_equal note, res['notes']
    lock.update(completed_by: @ta, grader: nil)
    # try one more time (changing problems) and fail
    res = attempt_grade_next(@ta, @student_reg1, qnum, pnum, allow_change_problems: true)
    assert_not (res['qnum'] == qnum && res['pnum'] == pnum)
  end

  test 'cannot steal a lock as ta' do
    qnum, pnum = @qps.first
    [@ta2, @prof].each do |curGrader|
      lock = lock_for(@student_reg1, qnum, pnum)
      lock.update(grader: curGrader)
      res = attempt_lock(@ta, @student_reg1, qnum, pnum, steal: true)
      assert_not res['acquired']
      @student_reg1.reload
      lock = lock_for(@student_reg1, qnum, pnum)
      assert_not_nil lock
      assert_equal curGrader, lock.grader
    end
  end

  test 'cannot reacquire a lock' do
    qnum, pnum = @qps.first
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
    qnum, pnum = @qps.first
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
    qnum, pnum = @qps.first
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
    qnum, pnum = @qps.first
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
    qnum, pnum = @qps.first
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
    assert @qps.length, @exam.grading_locks.length
    res = attempt_unlock_all(@prof, @exam, raw: true)
    assert_not res['errors']
    assert res['data']['releaseAllGradingLocks']['released']
    @exam.reload
    assert 0, @exam.grading_locks.length
  end
end
