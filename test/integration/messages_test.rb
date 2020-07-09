# frozen_string_literal: true

require 'test_helper'

class MessagesTest < ActionDispatch::IntegrationTest
  def setup
    @professor_course_registration = create(:professor_course_registration)
    @course = @professor_course_registration.course
    @prof = @professor_course_registration.user
    @exam = create(:exam, course: @course)
    @version = create(:exam_version, exam: @exam)
    @room = create(:room, exam: @exam)
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
  end

  SEND_MESSAGE_QUERY = <<-GRAPHQL
    mutation sendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        clientMutationId
      }
    }
  GRAPHQL

  test 'send exam message as student does not work' do
    assert_equal 0, @exam.exam_announcements.length
    result = HourglassSchema.do_mutation!(SEND_MESSAGE_QUERY, @student, {
      recipientId: HourglassSchema.id_from_object(@exam, Types::ExamType, {}),
      message: 'Test announcement',
    })

    assert_equal 1, result['errors'].length
    @exam.reload
    assert_equal 0, @exam.exam_announcements.length
  end

  test 'send exam message' do
    assert_equal 0, @exam.exam_announcements.length
    result = HourglassSchema.do_mutation!(SEND_MESSAGE_QUERY, @prof, {
      recipientId: HourglassSchema.id_from_object(@exam, Types::ExamType, {}),
      message: 'Test announcement',
    })

    assert_not result['errors']
    @exam.reload
    assert_equal 1, @exam.exam_announcements.length
  end

  test 'send version message' do
    assert_equal 0, @version.version_announcements.length
    result = HourglassSchema.do_mutation!(SEND_MESSAGE_QUERY, @prof, {
      recipientId: HourglassSchema.id_from_object(@version, Types::ExamVersionType, {}),
      message: 'Test message',
    })

    assert_not result['errors']
    @version.reload
    assert_equal 1, @version.version_announcements.length
  end

  test 'send room message' do
    assert_equal 0, @room.room_announcements.length
    result = HourglassSchema.do_mutation!(SEND_MESSAGE_QUERY, @prof, {
      recipientId: HourglassSchema.id_from_object(@room, Types::RoomType, {}),
      message: 'Test room message',
    })

    assert_not result['errors']
    @room.reload
    assert_equal 1, @room.room_announcements.length
  end

  test 'send direct message' do
    assert_equal 0, @registration.messages.length
    result = HourglassSchema.do_mutation!(SEND_MESSAGE_QUERY, @prof, {
      recipientId: HourglassSchema.id_from_object(@registration, Types::RegistrationType, {}),
      message: 'Test student message',
    })

    assert_not result['errors']
    @registration.reload
    assert_equal 1, @registration.messages.length
  end
end
