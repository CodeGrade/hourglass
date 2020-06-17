# frozen_string_literal: true

require 'test_helper'

class ExamVersionTest < ActiveSupport::TestCase
  def condense_yaml(name)
    parse_yaml(name).to_json
  end

  def parse_yaml(name)
    yaml_path = Rails.root.join('test', 'fixtures', 'files', name, 'exam.yaml')
    YAML.safe_load(File.read(yaml_path))
  end

  test 'factory builds valid exams' do
    assert build(:exam_version).valid?
  end

  test 'cs2500_v1 info validates' do
    ev = build(:exam_version, :cs2500_v1)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs2500_v2 info validates' do
    ev = build(:exam_version, :cs2500_v2)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v1 exam info validates' do
    ev = build(:exam_version, :cs3500_v1)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v2 exam info validates' do
    ev = build(:exam_version, :cs3500_v2)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v2 file validates against save-schema' do
    parsed = parse_yaml 'cs3500final-v2'
    assert JSON::Validator.validate(ExamVersion::EXAM_SAVE_SCHEMA, parsed['info'])
    assert JSON::Validator.validate(ExamVersion::FILES_SCHEMA, parsed['files'])
  end

  test 'cs3500_v2 info is the same as its input' do
    ev = build(:exam_version, :cs3500_v2)
    parsed = parse_yaml 'cs3500final-v2'
    assert_equal parsed['info'], ev.info
    assert_equal parsed['files'], ev.files
  end

  test 'cs3500_v2 output_json' do
    ev = build(:exam_version, :cs3500_v2)
    json = condense_yaml 'cs3500final-v2'
    assert_equal json, ev.export_json
  end

  test 'cs2500 is the same when exported and reimported' do
    ev = build(:exam_version, :cs2500_v1)
    Dir.mktmpdir do |path|
      ev.export_all(path)
      UploadTestHelper.with_temp_zip(Pathname.new(path).join('**')) do |zip|
        up = Upload.new(Rack::Test::UploadedFile.new(zip))
        new_ev = create(:exam_version, :cs2500_v1, upload: up)
        assert_equal ev.info, new_ev.info
        assert_equal ev.files, new_ev.files
      end
    end
  end
end
