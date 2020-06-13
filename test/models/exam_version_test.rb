# frozen_string_literal: true

require 'test_helper'

class ExamVersionTest < ActiveSupport::TestCase
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

  # test 'build exam version with upload containing upload-schema' do
  #   upload = ...
  #   ev = build(:exam_version, upload: upload)
  #   assert ev.valid?
  # end

  # test 'build exam version with upload containing save-schema' do
  #   ev = build(:exam_version)
  #   assert ev.valid?
  # end
end
