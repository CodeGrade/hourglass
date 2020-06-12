# frozen_string_literal: true

require 'test_helper'

class VersionsControllerTest < ActionDispatch::IntegrationTest
  def assert_updatable(ver)
    new_name = 'New Version Name'
    patch api_professor_version_path(ver), as: :json, params: {
      'version' => {
        'name' => new_name,
        'info' => {
          'policies' => [],
          'answers' => [],
          'contents' => {
            'questions' => [],
            'reference' => [],
            'instructions' => { 'type' => 'HTML', 'value' => '' }
          }
        },
        'files' => []
      }
    }
    assert_response :success
    expected = { 'updated' => true }
    ver.reload
    assert_equal expected, JSON.parse(response.body)
    assert_equal new_name, ver.name
  end

  test 'cannot create exam version without being logged in' do
    reg = create(:professor_course_registration)
    exam = create(:exam, course: reg.course)
    post api_professor_versions_path(exam)
    assert_response :unauthorized
  end

  test 'student cannot create exam version' do
    reg = create(:registration)
    sign_in reg.user
    post api_professor_versions_path(reg.exam)
    assert_response :forbidden
  end

  test 'student cannot edit exam version' do
    reg = create(:registration)
    sign_in reg.user
    patch api_professor_version_path(reg.exam_version)
    assert_response :forbidden
  end

  test 'student cannot destroy exam version' do
    reg = create(:registration)
    sign_in reg.user
    delete api_professor_version_path(reg.exam_version)
    assert_response :forbidden
  end

  test 'should create new exam version' do
    reg = create(:professor_course_registration)
    exam = create(:exam, course: reg.course)
    sign_in reg.user
    post api_professor_versions_path(exam)
    assert_response :success
    parsed = JSON.parse(response.body)
    expected = {
      'name' => "#{exam.name} Version 1",
      'policies' => [],
      'contents' => {
        'exam' => {
          'questions' => [],
          'reference' => [],
          'instructions' => {
            'type' => 'HTML',
            'value' => ''
          },
          'files' => []
        },
        'answers' => { 'answers' => [] }
      },
      'anyStarted' => false
    }
    assert_equal expected, parsed.except('id')
    assert parsed['id'].integer?
  end

  test 'should update exam version' do
    ver = create(:exam_version)
    reg = create(:professor_course_registration, course: ver.exam.course)
    sign_in reg.user
    assert_updatable ver
  end

  test 'should update exam version with started submissions' do
    exam = create(:exam, :with_started_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: ver.exam.course)
    sign_in reg.user
    assert_updatable ver
  end

  test 'should update exam version with finished submissions' do
    exam = create(:exam, :with_finished_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: ver.exam.course)
    sign_in reg.user
    assert_updatable ver
  end

  test 'should destroy exam version' do
    ver = create(:exam_version)
    exam = ver.exam
    reg = create(:professor_course_registration, course: exam.course)
    prof = reg.user
    sign_in prof
    assert_equal 1, exam.exam_versions.length
    delete api_professor_version_path(ver)
    assert_response :success
    assert_raise { ver.reload }
    exam.reload
    assert_equal 0, exam.exam_versions.length
  end

  test 'should not destroy exam version with started registrations' do
    exam = create(:exam, :with_started_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: exam.course)
    prof = reg.user
    sign_in prof
    delete api_professor_version_path(ver)
    assert_response :conflict
    ver.reload
    assert_not ver.destroyed?
  end

  test 'should not destroy exam version with final registrations' do
    exam = create(:exam, :with_finished_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: exam.course)
    prof = reg.user
    sign_in prof
    delete api_professor_version_path(ver)
    assert_response :conflict
    ver.reload
    assert_not ver.destroyed?
  end
end
