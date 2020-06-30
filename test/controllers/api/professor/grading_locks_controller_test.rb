# frozen_string_literal: true

require 'test_helper'

class GradingLocksControllerTest < ActionDispatch::IntegrationTest
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
    @lock1 = create(:grading_lock, registration: @student_reg1, grader: @grader)
    @lock2 = create(:grading_lock, registration: @student_reg1, grader: @ta, pnum: 1)
    sign_in @prof
  end

  test 'index grading locks' do
    get api_professor_grading_locks_path(@exam), as: :json
    assert_response :success
    parsed = JSON.parse(response.body)
    assert_equal [
      { 'id' => @lock1.id },
      { 'id' => @lock2.id },
    ].to_set, parsed['gradingLocks'].to_set
  end

  test 'release multiple locks' do
    assert 2, @exam.grading_locks.length
    post release_all_api_professor_grading_locks_path(@exam)
    assert_response :success
    @exam.reload
    assert 0, @exam.grading_locks.length
  end
end
