# frozen_string_literal: true

require 'test_helper'

class ExamVersionTest < ActiveSupport::TestCase
  def condense_yaml(name)
    JSON.pretty_generate(compact_blank(parse_yaml(name)))
  end

  def parse_yaml(name)
    yaml_path = Rails.root.join('test', 'fixtures', 'files', name, 'exam.yaml')
    YAML.safe_load(File.read(yaml_path))
  end

  test 'factory builds valid exams' do
    assert build(:exam_version).valid?
  end

  test 'cs2500_v1 info validates' do
    ev = create(:exam_version, :cs2500_v1)
    assert JSON::Validator.validate!(ExamVersion::EXAM_UPLOAD_SCHEMA, ev.export_exam_info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs2500_v2 info validates' do
    ev = create(:exam_version, :cs2500_v2)
    assert JSON::Validator.validate!(ExamVersion::EXAM_UPLOAD_SCHEMA, ev.export_exam_info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v1 exam info validates' do
    ev = create(:exam_version, :cs3500_v1)
    assert JSON::Validator.validate!(ExamVersion::EXAM_UPLOAD_SCHEMA, ev.export_exam_info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v2 exam info validates' do
    ev = create(:exam_version, :cs3500_v2)
    assert JSON::Validator.validate!(ExamVersion::EXAM_UPLOAD_SCHEMA, ev.export_exam_info)
    assert JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, ev.files)
  end

  test 'cs3500_v2 file validates against save-schema' do
    parsed = parse_yaml 'cs3500final-v2'
    assert JSON::Validator.validate(ExamVersion::EXAM_UPLOAD_SCHEMA, parsed['info'])
    assert JSON::Validator.validate(ExamVersion::FILES_SCHEMA, parsed['files'])
  end

  test 'cs3500_v2 info is the same as its input' do
    ev = create(:exam_version, :cs3500_v2)
    parsed = parse_yaml 'cs3500final-v2'
    assert_equal compact_blank(parsed['info']), compact_blank(ev.export_exam_info)
    assert_equal compact_blank(parsed['files']) || [], compact_blank(ev.files) || []
  end

  test 'cs3500_v2 output_json' do
    ev = create(:exam_version, :cs3500_v2)
    json = condense_yaml 'cs3500final-v2'
    assert_equal json, ev.export_json(include_files: true)
  end

  test 'cs2500 is the same when exported and reimported' do
    ev = create(:exam_version, :cs2500_v1)
    ArchiveUtils.mktmpdir do |path|
      ev.export_all(path)
      UploadTestHelper.with_temp_zip(Pathname.new(path).join('**')) do |zip|
        up = Upload.new(Rack::Test::UploadedFile.new(zip))
        new_ev = create(:exam_version, :cs2500_v1, upload: up)
        assert_equal ev.export_exam_info, new_ev.export_exam_info
        assert_equal ev.files, new_ev.files
      end
    end
  end

  test 'questions are ordered' do
    ev = create(:exam_version, :blank)
    assert ev.db_questions.empty?
    (0..4).to_a.shuffle.each do |i|
      ev.db_questions << Question.new(name: "Question #{i}", index: i)
    end
    ev.db_questions.reset
    assert_equal ev.db_questions.count, 5
    assert ev.db_questions.sorted_by?(&:index)
  end

  def create_numbered_questions(version, num_questions)
    assert version.db_questions.empty?
    (0...num_questions).to_a.shuffle.each do |i|
      version.db_questions << Question.new(name: "Question #{i}", index: i)
    end
    assert_equal version.db_questions.count, num_questions
  end

  def reset_numbered_questions(version)
    Question.transaction do
      # rubocop:disable Rails/SkipsModelValidations, Style/CombinableLoops
      version.db_questions.each { |q| q.update_columns(index: 1000 + q.index) }
      version.db_questions.each { |q| q.update_columns(index: q.name.split[1].to_i) }
      # rubocop:enable Rails/SkipsModelValidations, Style/CombinableLoops
    end
    version.db_questions.reset
  end

  test 'can swap questions' do
    num_questions = 5
    ev = create(:exam_version, :blank)
    create_numbered_questions(ev, num_questions)
    (0...num_questions).each do |from|
      (0...num_questions).each do |to|
        reset_numbered_questions(ev)
        assert ev.db_questions.sorted_by?(&:index)
        q_order = ev.db_questions.pluck(:id)
        ev.swap_questions(from, to)
        q_order[from], q_order[to] = q_order[to], q_order[from]
        assert_equal ev.db_questions.pluck(:id), q_order
      end
    end
  end

  test 'can move questions' do
    num_questions = 5
    ev = create(:exam_version, :blank)
    create_numbered_questions(ev, num_questions)
    (0...num_questions).each do |from|
      (0...num_questions).each do |to|
        reset_numbered_questions(ev)
        assert ev.db_questions.sorted_by?(&:index)
        q_order = ev.db_questions.pluck(:id)
        ev.move_questions(from, to)
        cycle = q_order.slice!([from, to].min..[from, to].max)
        cycle.rotate!(from < to ? 1 : -1)
        q_order.insert([from, to].min, *cycle)
        assert_equal ev.db_questions.pluck(:id), q_order
      end
    end
  end
end
