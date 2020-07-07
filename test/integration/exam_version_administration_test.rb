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

  def try_update(ver, user:)
    new_name = 'New Version Name'
    HourglassSchema.do_mutation!(UPDATE_EXAM_VERSION, user, {
      examVersionId: HourglassSchema.id_from_object(ver, Types::ExamVersionType, {}),
      name: new_name,
      info: ver.info.to_s,
      files: ver.files.to_s,
    })
  end

  def assert_updatable(ver, user:)
    result = try_update(ver, user: user)
    assert_equal 0, result['errors'].length
    ver.reload
    assert_equal new_name, ver.name
  end

  def assert_not_updatable(ver, user:)
    old_name = ver.name
    result = try_update(ver, user: user)
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

  # test 'should create new exam version' do
  #   reg = create(:professor_course_registration)
  #   exam = create(:exam, course: reg.course)
  #   sign_in reg.user
  #   post api_professor_versions_path(exam)
  #   assert_response :success
  #   parsed = JSON.parse(response.body)
  #   expected = {
  #     'name' => "#{exam.name} Version 1",
  #     'policies' => [],
  #     'contents' => {
  #       'exam' => {
  #         'questions' => [],
  #         'reference' => [],
  #         'instructions' => {
  #           'type' => 'HTML',
  #           'value' => '',
  #         },
  #         'files' => [],
  #       },
  #       'answers' => { 'answers' => [] },
  #     },
  #     'anyStarted' => false,
  #   }
  #   assert_equal expected, parsed.except('id')
  #   assert parsed['id'].integer?
  # end

  # test 'should update exam version' do
  #   ver = create(:exam_version)
  #   reg = create(:professor_course_registration, course: ver.exam.course)
  #   sign_in reg.user
  #   assert_updatable ver
  # end

  # test 'should update exam version with started submissions' do
  #   exam = create(:exam, :with_started_submissions)
  #   ver = exam.exam_versions.first
  #   reg = create(:professor_course_registration, course: ver.exam.course)
  #   sign_in reg.user
  #   assert_updatable ver
  # end

  # test 'should update exam version with finished submissions' do
  #   exam = create(:exam, :with_finished_submissions)
  #   ver = exam.exam_versions.first
  #   reg = create(:professor_course_registration, course: ver.exam.course)
  #   sign_in reg.user
  #   assert_updatable ver
  # end

  test 'should destroy exam version' do
    ver = create(:exam_version)
    exam = ver.exam
    reg = create(:professor_course_registration, course: exam.course)
    assert_equal 1, exam.exam_versions.length
    assert_destroyable(ver, user: reg.user)
    exam.reload
    assert_equal 0, exam.exam_versions.length
  end

  # test 'should not destroy exam version with started registrations' do
  #   exam = create(:exam, :with_started_submissions)
  #   ver = exam.exam_versions.first
  #   reg = create(:professor_course_registration, course: exam.course)
  #   prof = reg.user
  #   sign_in prof
  #   delete api_professor_version_path(ver)
  #   assert_response :conflict
  #   ver.reload
  #   assert_not ver.destroyed?
  # end

  # test 'should not destroy exam version with final registrations' do
  #   exam = create(:exam, :with_finished_submissions)
  #   ver = exam.exam_versions.first
  #   reg = create(:professor_course_registration, course: exam.course)
  #   prof = reg.user
  #   sign_in prof
  #   delete api_professor_version_path(ver)
  #   assert_response :conflict
  #   ver.reload
  #   assert_not ver.destroyed?
  # end

  # test 'should import exam version' do
  #   exam = create(:exam)
  #   reg = create(:professor_course_registration, course: exam.course)
  #   assert_equal 0, exam.exam_versions.length
  #   sign_in reg.user
  #   UploadTestHelper.with_test_uploaded_fixture_zip 'cs3500final-v1' do |upload|
  #     post import_api_professor_versions_path(exam), params: {
  #       upload: upload,
  #     }
  #   end
  #   assert_response :created
  #   exam.reload
  #   assert_equal 1, exam.exam_versions.length

  #   created = exam.exam_versions.first
  #   ev = create(:exam_version, :cs3500_v1)
  #   assert_equal ev.info, exam.exam_versions.first.info
  #   assert_equal ev.files, exam.exam_versions.first.files
  # end

  # test 'should export exam version single file' do
  #   ev = create(:exam_version)
  #   reg = create(:professor_course_registration, course: ev.exam.course)
  #   sign_in reg.user

  #   get export_file_api_professor_version_path(ev)
  #   parsed = JSON.parse(response.body)
  #   assert_equal ev.info, parsed['info']
  #   assert_equal ev.files, parsed['files']
  # end

  # test 'should not export exam version single file for student' do
  #   ev = create(:exam_version)
  #   reg = create(:registration, exam: ev.exam)
  #   sign_in reg.user

  #   get export_file_api_professor_version_path(ev)
  #   assert_response :forbidden
  #   assert_empty response.body
  # end

  # test 'should export exam version archive' do
  #   ev = create(:exam_version)
  #   exam = ev.exam
  #   assert_equal 1, exam.exam_versions.length
  #   reg = create(:professor_course_registration, course: ev.exam.course)
  #   sign_in reg.user

  #   get export_archive_api_professor_version_path(ev)
  #   assert_response :success
  #   assert_not_empty response.body

  #   Tempfile.create do |zip|
  #     zip.write response.body
  #     zip.rewind
  #     up = Upload.new(Rack::Test::UploadedFile.new(zip, 'application/zip'))
  #     new_ev = create(:exam_version, :cs2500_v1, upload: up)
  #     assert_equal ev.info, new_ev.info
  #     assert_equal ev.files, new_ev.files
  #   end
  # end

  # test 'should not export exam version archive for student' do
  #   ev = create(:exam_version)
  #   exam = ev.exam
  #   reg = create(:registration, exam: exam)
  #   sign_in reg.user

  #   get export_archive_api_professor_version_path(ev)
  #   assert_response :forbidden
  #   assert_empty response.body
  # end
end
