# frozen_string_literal: true

require 'test_helper'

class MessagesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @professor_course_registration = create(:professor_course_registration)
    @course = @professor_course_registration.course
    @prof = @professor_course_registration.user
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @room = create(:room, exam: @exam)
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    sign_in @prof
  end

  test 'send exam message' do
    assert_equal 0, @exam.exam_announcements.length
    post api_proctor_messages_path(@exam), as: :json, params: {
      'message': {
        'body' => 'Test message',
        'recipient' => {
          'type' => 'EXAM',
        },
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @exam.reload
    assert_equal 1, @exam.exam_announcements.length
  end

  test 'send version message' do
    assert_equal 0, @version.version_announcements.length
    post api_proctor_messages_path(@exam), as: :json, params: {
      'message': {
        'body' => 'Test message',
        'recipient' => {
          'type' => 'VERSION',
          'id' => @version.id,
        },
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @version.reload
    assert_equal 1, @version.version_announcements.length
  end

  test 'send room message' do
    assert_equal 0, @room.room_announcements.length
    post api_proctor_messages_path(@exam), as: :json, params: {
      'message': {
        'body' => 'Test message',
        'recipient' => {
          'type' => 'ROOM',
          'id' => @room.id,
        },
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @room.reload
    assert_equal 1, @room.room_announcements.length
  end

  test 'send direct message' do
    assert_equal 0, @exam.messages.length
    post api_proctor_messages_path(@exam), as: :json, params: {
      'message': {
        'body' => 'Test message',
        'recipient' => {
          'type' => 'DIRECT',
          'id' => @student.id,
        },
      },
    }
    assert_response :success
    expected = { 'success' => true }
    assert_equal expected, JSON.parse(response.body)
    @exam.reload
    assert_equal 1, @exam.messages.length
  end
end
