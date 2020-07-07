# frozen_string_literal: true

require 'test_helper'

class ExamVersionAdministrationTest < ActionDispatch::IntegrationTest
  UPDATE_EXAM_VERSION = <<-GRAPHQL
    mutation updateExamVersion($input: UpdateExamVersionInput!) {
      updateExamVersion(input: $input) {
        examVersion {
          id
        }
      }
    }
  GRAPHQL

  CREATE_EXAM_VERSION = <<-GRAPHQL
    mutation createExamVersion($input: CreateExamVersionInput!) {
      createExamVersion(input: $input) {
        examVersion {
          id
          name
        }
      }
    }
  GRAPHQL

  DESTROY_EXAM_VERSION = <<-GRAPHQL
    mutation destroyExamVersion($input: DestroyExamVersionInput!) {
      destroyExamVersion(input: $input) {
        deletedId
      }
    }
  GRAPHQL

  def try_update(ver, new_name:, user:)
    HourglassSchema.do_mutation!(UPDATE_EXAM_VERSION, user, {
      examVersionId: HourglassSchema.id_from_object(ver, Types::ExamVersionType, {}),
      name: new_name,
      info: ver.info.to_json,
      files: ver.files.to_json,
    })
  end

  def assert_updatable(ver, user:)
    new_name = 'New version name'
    result = try_update(ver, new_name: new_name, user: user)
    assert_not result['errors']
    ver.reload
    assert_equal new_name, ver.name
  end

  def assert_not_updatable(ver, user:)
    old_name = ver.name
    result = try_update(ver, new_name: old_name + '!', user: user)
    assert result['errors']
    assert_not result['errors'].empty?
    ver.reload
    assert_equal old_name, ver.name
    result
  end

  def try_destroy(ver, user:)
    HourglassSchema.do_mutation!(DESTROY_EXAM_VERSION, user, {
      examVersionId: HourglassSchema.id_from_object(ver, Types::ExamVersionType, {}),
    })
  end

  def assert_not_destroyable(ver, user:)
    result = try_destroy(ver, user: user)
    assert result['errors']
    assert_not result['errors'].empty?
    ver.reload
    assert_not ver.destroyed?
    result
  end

  def assert_destroyable(ver, user:)
    exam = ver.exam
    old_length = exam.exam_versions.length
    result = try_destroy(ver, user: user)
    assert_not result['errors']
    assert_raise { ver.reload }
    exam.reload
    assert_equal old_length - 1, exam.exam_versions.length
    result
  end

  test 'cannot create exam version without being logged in' do
    exam = create(:exam)
    result = HourglassSchema.do_mutation!(CREATE_EXAM_VERSION, nil, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
    assert_equal 1, result['errors'].length
  end

  test 'student cannot create exam version' do
    reg = create(:registration)
    exam = create(:exam, course: reg.course)
    result = HourglassSchema.do_mutation!(CREATE_EXAM_VERSION, reg.user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
    assert_equal 1, result['errors'].length
    assert_match(/permission/, result['errors'][0]['message'])
    exam.reload
    assert_equal 0, exam.exam_versions.length
  end

  test 'student cannot edit exam version' do
    reg = create(:registration)
    result = assert_not_updatable(reg.exam_version, user: reg.user)
    assert_match(/permission/, result['errors'][0]['message'])
  end

  test 'student cannot destroy exam version' do
    reg = create(:registration)
    result = assert_not_destroyable(reg.exam_version, user: reg.user)
    assert_match(/permission/, result['errors'][0]['message'])
  end

  test 'should create new exam version' do
    reg = create(:professor_course_registration)
    exam = create(:exam, course: reg.course)
    result = HourglassSchema.do_mutation!(CREATE_EXAM_VERSION, reg.user, {
      examId: HourglassSchema.id_from_object(exam, Types::ExamType, {}),
    })
    assert_not result['errors']
    expected_name = "#{exam.name} Version 1"
    assert_equal expected_name, result['data']['createExamVersion']['examVersion']['name']
  end

  test 'should update exam version' do
    ver = create(:exam_version)
    reg = create(:professor_course_registration, course: ver.exam.course)
    assert_updatable ver, user: reg.user
  end

  test 'should update exam version with started submissions' do
    exam = create(:exam, :with_started_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: ver.exam.course)
    assert_updatable ver, user: reg.user
  end

  test 'should update exam version with finished submissions' do
    exam = create(:exam, :with_finished_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: ver.exam.course)
    assert_updatable ver, user: reg.user
  end

  test 'should destroy exam version' do
    ver = create(:exam_version)
    exam = ver.exam
    reg = create(:professor_course_registration, course: exam.course)
    assert_equal 1, exam.exam_versions.length
    assert_destroyable(ver, user: reg.user)
    exam.reload
    assert_equal 0, exam.exam_versions.length
  end

  test 'should not destroy exam version with started registrations' do
    exam = create(:exam, :with_started_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: exam.course)
    prof = reg.user
    result = assert_not_destroyable ver, user: prof
    assert_match(/started/, result['errors'][0]['message'])
    ver.reload
    assert_not ver.destroyed?
  end

  test 'should not destroy exam version with final registrations' do
    exam = create(:exam, :with_finished_submissions)
    ver = exam.exam_versions.first
    reg = create(:professor_course_registration, course: exam.course)
    prof = reg.user
    result = assert_not_destroyable ver, user: prof
    assert_match(/finished/, result['errors'][0]['message'])
    ver.reload
    assert_not ver.destroyed?
  end
end
