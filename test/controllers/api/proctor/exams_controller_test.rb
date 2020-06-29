# frozen_string_literal: true

require 'test_helper'

class ExamsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @professor_course_registration = create(:professor_course_registration)
    @course = @professor_course_registration.course
    @prof = @professor_course_registration.user
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @room = create(:room, exam: @exam)
    @registration = create(:registration, exam_version: @version, room: @room)
    @student = @registration.user
    sign_in @prof
  end

  # TODO test all four 'already finalized' messages
  # TODO test invalid type
  # TODO test version ID for different exam

  test 'finalize exam' do
    # TODO students in different exams
    # TODO test finalizes students not in rooms
    assert_not @exam.finalized?
    assert_not @version.finalized?
    assert_not @registration.final?
    assert_not @room.finalized?
    post finalize_api_proctor_exam_path(@exam), as: :json, params: {
      'target' => {
        'type' => 'EXAM',
        'id' => @exam.id,
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @registration.reload
    @room.reload
    @version.reload
    @exam.reload
    assert @registration.final?
    assert @room.finalized?
    assert @version.finalized?
    assert @exam.finalized?
  end

  test 'finalize version' do
    # TODO students in different versions
    # TODO test finalizes students not in rooms
    assert_not @version.finalized?
    assert_not @registration.final?
    assert_not @room.finalized?
    post finalize_api_proctor_exam_path(@exam), as: :json, params: {
      'target' => {
        'type' => 'VERSION',
        'id' => @version.id,
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @registration.reload
    @room.reload
    @version.reload
    assert @registration.final?
    assert @room.finalized?
    assert @version.finalized?
  end

  test 'finalize room' do
    # TODO students in different rooms
    assert_not @registration.final?
    assert_not @room.finalized?
    post finalize_api_proctor_exam_path(@exam), as: :json, params: {
      'target' => {
        'type' => 'ROOM',
        'id' => @room.id,
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @registration.reload
    @room.reload
    assert @registration.final?
    assert @room.finalized?
  end

  test 'finalize user' do
    assert_not @registration.final?
    post finalize_api_proctor_exam_path(@exam), as: :json, params: {
      'target' => {
        'type' => 'USER',
        'id' => @student.id,
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @registration.reload
    assert @registration.final?
  end
end
