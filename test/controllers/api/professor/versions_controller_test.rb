# frozen_string_literal: true

require 'test_helper'

class VersionsControllerTest < ActionDispatch::IntegrationTest
  test 'should import exam version' do
    exam = create(:exam)
    reg = create(:professor_course_registration, course: exam.course)
    assert_equal 0, exam.exam_versions.length
    sign_in reg.user
    UploadTestHelper.with_test_uploaded_fixture_zip 'cs3500final-v1' do |upload|
      post import_api_professor_versions_path(exam), params: {
        upload: upload,
      }
    end
    assert_response :created
    exam.reload
    assert_equal 1, exam.exam_versions.length

    created = exam.exam_versions.first
    ev = create(:exam_version, :cs3500_v1)
    assert_equal ev.info, created.info
    assert_equal ev.files, created.files
  end

  test 'should export exam version single file' do
    ev = create(:exam_version)
    reg = create(:professor_course_registration, course: ev.exam.course)
    sign_in reg.user

    get export_file_api_professor_version_path(ev)
    parsed = JSON.parse(response.body)
    assert_equal ev.info, parsed['info']
    assert_equal ev.files, parsed['files']
  end

  test 'should not export exam version single file for student' do
    ev = create(:exam_version)
    reg = create(:registration, exam: ev.exam)
    sign_in reg.user

    get export_file_api_professor_version_path(ev)
    assert_response :forbidden
    assert_empty response.body
  end

  test 'should export exam version archive' do
    ev = create(:exam_version)
    exam = ev.exam
    assert_equal 1, exam.exam_versions.length
    reg = create(:professor_course_registration, course: ev.exam.course)
    sign_in reg.user

    get export_archive_api_professor_version_path(ev)
    assert_response :success
    assert_not_empty response.body

    Tempfile.create do |zip|
      zip.write response.body
      zip.rewind
      up = Upload.new(Rack::Test::UploadedFile.new(zip, 'application/zip'))
      new_ev = create(:exam_version, :cs2500_v1, upload: up)
      assert_equal ev.info, new_ev.info
      assert_equal ev.files, new_ev.files
    end
  end

  test 'should not export exam version archive for student' do
    ev = create(:exam_version)
    exam = ev.exam
    reg = create(:registration, exam: exam)
    sign_in reg.user

    get export_archive_api_professor_version_path(ev)
    assert_response :forbidden
    assert_empty response.body
  end
end
