# frozen_string_literal: true

require 'test_helper'

class ExamVersionTest < ActiveSupport::TestCase
  def yaml_contents(name)
    yaml_path = Rails.root.join('test', 'fixtures', 'files', name, 'exam.yaml')
    YAML.safe_load(File.read(yaml_path))
  end

  test 'factory builds valid exams' do
    assert build(:exam_version).valid?
  end

  test 'exam info validates' do
    ev = build(:exam_version)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
  end

  test 'cs3500_v1 exam info validates' do
    ev = build(:exam_version, :cs3500_v1)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
  end

  test 'cs3500_v2 exam info validates' do
    ev = build(:exam_version, :cs3500_v2)
    assert JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, ev.info)
  end

  test 'cs3500_v2 file validates against save-schema' do
    parsed = yaml_contents 'cs3500final-v2'
    assert JSON::Validator.validate(ExamVersion::EXAM_SAVE_SCHEMA, parsed)
  end

  test 'cs3500_v2 info is the same as its input' do
    ev = build(:exam_version, :cs3500_v2)
    parsed = yaml_contents 'cs3500final-v2'
    assert_equal parsed, ev.info
  end
end
