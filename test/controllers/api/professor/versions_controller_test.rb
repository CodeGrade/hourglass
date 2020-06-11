# frozen_string_literal: true

require 'test_helper'

class VersionsControllerTest < ActionDispatch::IntegrationTest
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
        'answers' => {
          'answers' => []
        }
      }
    }
    assert_equal expected, parsed.except('id')
    assert parsed['id'].integer?
  end
end
