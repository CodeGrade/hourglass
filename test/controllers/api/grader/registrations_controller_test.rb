# frozen_string_literal: true

require 'test_helper'

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @course = create(:course)
    @prof_reg = create(:professor_course_registration, course: @course)
    @prof = @prof_reg.user
    @section = create(:section, course: @course)
    @exam = create(:exam, :with_finished_submissions, course: @course)
    @student_reg1 = @exam.registrations.first
    @ta_reg = create(:staff_registration, :ta, section: @section)
    @ta = @ta_reg.user
    @grader_reg = create(:staff_registration, section: @section)
    @grader = @grader_reg.user
  end

  def attempt_lock(reg, qnum, pnum)
    post start_grading_api_grader_registration_path(reg), as: :json, params: {
      'qnum' => qnum,
      'pnum' => pnum,
    }
  end

  def attempt_unlock(reg, qnum, pnum)
    post finish_grading_api_grader_registration_path(reg), as: :json, params: {
      'qnum' => qnum,
      'pnum' => pnum,
    }
  end

  test 'acquiring a lock' do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'cannot reacquire a lock' do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    attempt_lock(@student_reg1, 0, 0)
    assert_response :conflict
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'cannot acquire a lock for a locked part' do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    sign_in @grader
    attempt_lock(@student_reg1, 0, 0)
    assert_response :conflict
    @student_reg1.reload
    locks = @student_reg1.grading_locks
    assert_equal 1, locks.length
    assert_equal @ta, locks.first.grader
  end

  test 'releasing a lock' do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader
    attempt_unlock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    assert_equal 0, @student_reg1.grading_locks.length
  end

  test "grader cannot release another grader's lock" do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader

    sign_in @grader
    attempt_unlock(@student_reg1, 0, 0)
    assert_response :forbidden
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
  end

  test 'professor can release a lock belonging to a grader' do
    sign_in @ta
    attempt_lock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    assert_equal 1, @student_reg1.grading_locks.length
    assert_equal @ta, @student_reg1.grading_locks.first.grader

    sign_in @prof
    attempt_unlock(@student_reg1, 0, 0)
    assert_response :success
    @student_reg1.reload
    assert_equal 0, @student_reg1.grading_locks.length
  end
end
