# frozen_string_literal: true

require 'marks_processor'

# A single version of an exam.
class ExamVersion < ApplicationRecord
  belongs_to :exam

  has_many :registrations, dependent: :destroy
  has_many :version_announcements, dependent: :destroy

  has_many :users, through: :registrations
  has_many :anomalies, through: :registrations
  has_many :grading_locks, through: :registrations

  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  validates :exam, presence: true

  delegate :course, to: :exam
  delegate :professors, to: :exam
  delegate :proctors_and_professors, to: :exam

  EXAM_SAVE_SCHEMA = Rails.root.join('config/schemas/exam-save.json').to_s
  validates :info, presence: true, json: {
    schema: -> { EXAM_SAVE_SCHEMA },
    message: ->(errors) { errors },
  }

  FILES_SCHEMA = Rails.root.join('config/schemas/files.json').to_s
  validates :files, presence: true, allow_blank: true, json: {
    schema: -> { FILES_SCHEMA },
    message: ->(errors) { errors },
  }

  def visible_to?(user)
    everyone.exists? user.id
  end

  def everyone
    proctors_and_professors.or(students)
  end

  def students
    User.where(id: registrations.select(:user_id))
  end

  def policies
    info['policies']
  end

  def contents
    info['contents']
  end

  def answers
    info['answers']
  end

  def questions
    contents['questions']
  end

  def reference
    contents['reference'] || []
  end

  def instructions
    contents['instructions'] || { type: 'HTML', value: '' }
  end

  def total_points
    questions.map { |q| q['parts'].map { |p| p['points'] }.sum }.sum
  end

  def default_answers
    def_answers = answers.map do |ans_q|
      ans_q.map do |ans_p|
        ans_p.map { |_| { "NO_ANS": true } }
      end
    end
    def_answers = [[[]]] if def_answers.empty?
    {
      answers: def_answers,
      scratch: '',
    }
  end

  # Because activerecord_json_validator defines its own
  # attr_writer for :info=, we need to wrap it here
  # instead of just calling super
  orig_info_eq = instance_method(:info=)
  define_method(:info=) do |*args, &block|
    res = orig_info_eq.bind(self).call(*args, &block)
    rubrics = res['rubrics'] || {}
    convert_rubric(rubrics['examRubric'], [nil, nil, nil])
    rubrics['questions']&.each_with_index do |qrubric, qnum|
      convert_rubric(qrubric['questionRubric'], [qnum, nil, nil])
      qrubric['parts']&.each_with_index do |prubric, pnum|
        convert_rubric(prubric['partRubric'], [qnum, pnum, nil])
        prubric['body']&.each_with_index do |brubric, bnum|
          convert_rubric(brubric, [qnum, pnum, bnum])
        end
      end
    end
    res
  end

  def convert_rubric(raw, qpb, order = nil, parent = nil)
    qnum, pnum, bnum = qpb
    if raw.nil?
      rubric = Rubric.new(
        type: 'None',
        qnum: qnum,
        pnum: pnum,
        bnum: bnum,
        order: order,
        parent_section: parent,
        exam_version: self,
      )
      rubrics << rubric
      return rubric
    end
    rubric = rubrics.find_or_initialize_by(id: raw['railsId'])
    rubric.assign_attributes(
      type: raw['type'].capitalize,
      qnum: qnum,
      pnum: pnum,
      bnum: bnum,
      order: order,
      parent_section: parent,
      description: raw.dig('description', 'value'),
      points: raw['points'],
      exam_version: self,
    )
    rubrics << rubric
    if raw['choices'].is_a? Hash
      convert_presets(raw['choices'], rubric)
    else
      subsection_ids = raw['choices']&.map { |sub| sub['railsId'] }&.compact
      to_be_deleted = rubric.subsections.where.not(id: subsection_ids)
      to_be_deleted.destroy_all
      raw['choices']&.each_with_index do |c, cindex|
        convert_rubric(c, qpb, cindex, rubric)
      end
    end
  end

  def convert_presets(presets, rubric)
    p = RubricPreset.find_or_initialize_by(id: presets['railsId'])
    puts "#{presets.inspect} vs #{p.new_record?} in #{rubric.rubric_preset&.id}"
    p.assign_attributes(
      label: presets['label'],
      direction: presets['direction'],
      mercy: presets['mercy']&.to_f,
    )
    rubric.rubric_preset = p
    comment_ids = presets['presets']&.map { |pre| pre['railsId'] }&.compact
    to_be_deleted = p.preset_comments.where.not(id: comment_ids)
    to_be_deleted.destroy_all
    presets['presets']&.each_with_index do |preset, pindex|
      c = p.preset_comments.find_or_initialize_by(id: preset['railsId'])
      c.assign_attributes(
        label: preset['label'],
        points: preset['points'],
        grader_hint: preset['graderHint'],
        student_feedback: preset['studentFeedback'],
        order: pindex,
        rubric_preset: p,
      )
      p.preset_comments << c
    end
  end

  def rubric_as_json
    rubric_tree = multi_group_by(rubrics_for_grading, [:qnum, :pnum, :bnum], true)
    preset_comments_in_use = preset_comments.joins(:grading_comments).pluck(:id)
    exam_rubric = rubric_tree.delete(nil)&.dig(nil, nil)&.as_json(preset_comments_in_use)
    q_rubrics = rubric_tree.sort.map do |_qnum, rubrics_q|
      question_rubric = rubrics_q.delete(nil)&.dig(nil)&.as_json(preset_comments_in_use)
      p_rubrics = rubrics_q.sort.map do |_pnum, rubrics_p|
        part_rubric = rubrics_p.delete(nil)&.as_json(preset_comments_in_use)
        b_rubrics = rubrics_p.sort.map { |_, b| b.as_json(preset_comments_in_use) }
        {
          partRubric: part_rubric,
          body: b_rubrics,
        }.compact
      end
      {
        questionRubric: question_rubric,
        parts: p_rubrics,
      }.compact
    end
    {
      examRubric: exam_rubric,
      questions: q_rubrics,
    }.compact.deep_stringify_keys
  end

  def compare_rubrics(rub1, rub2)
    compare_help('ROOT', rub1, rub2)
    true
  rescue RuntimeError => e
    e.message
  end

  def compare_help(path, rub1, rub2)
    if rub1.is_a?(Hash) && rub2.is_a?(Hash)
      compare_hashes(path, rub1, rub2)
    elsif rub1.is_a?(Array) && rub2.is_a?(Array)
      compare_arrays(path, rub1, rub2)
    elsif rub1 != rub2
      raise "Not equal at #{path}: #{rub1} != #{rub2}"
    end
  end

  def compare_hashes(path, rub1, rub2)
    mismatch = rub1.keys.to_set ^ rub2.keys.to_set
    mismatch.delete 'railsId' # Ignore tedious bookeeping
    unless mismatch.empty?
      err = "Mismatched keys at #{path}: #{rub1.keys} ^ #{rub2.keys} = #{mismatch}"
      raise err
    end
    rub1.keys.each do |k|
      next if k == 'railsId'

      compare_help "#{path}.#{k}", rub1[k], rub2[k]
    end
  end

  def compare_arrays(path, rub1, rub2)
    unless rub1.length == rub2.length
      err = "Mismatched lengths at #{path}: #{rub1.length} vs #{rub2.length}"
      raise err
    end
    (0...rub1.length).each do |i|
      compare_help "#{path}[#{i}]", rub1[i], rub2[i]
    end
  end

  def score_for(reg)
    comments = multi_group_by(reg.grading_comments, [:qnum, :pnum, :bnum, :preset_comment])
    checks = multi_group_by(reg.grading_checks, [:qnum, :pnum, :bnum])
    rubrics_for_grading.sum do |r|
      r.compute_grade_for(reg, comments, checks, [r.qnum, r.pnum, r.bnum])
    end
  rescue RuntimeError => e
    Rails.logger.debug e.message
    Rails.logger.debug e.backtrace
  end

  # Tree of questions to parts to score for that part
  def part_scores_for(reg)
    comments = multi_group_by(reg.grading_comments, [:qnum, :pnum, :bnum, :preset_comment])
    checks = multi_group_by(reg.grading_checks, [:qnum, :pnum, :bnum])
    rubric_tree = multi_group_by(rubrics_for_grading, [:qnum, :pnum, :bnum], true)
    exam_rubric = rubric_tree.dig(nil, nil, nil)
    part_tree do |qnum:, pnum:, **|
      question_rubric = rubric_tree.dig(qnum, nil, nil)
      part_rubric = rubric_tree.dig(qnum, pnum, nil)
      qp = [qnum, pnum, nil]
      [
        exam_rubric&.compute_grade_for(reg, comments, checks, qp),
        question_rubric&.compute_grade_for(reg, comments, checks, qp),
        part_rubric&.compute_grade_for(reg, comments, checks, qp),
      ].compact.sum + rubric_tree.dig(qnum, pnum)&.sum do |key, r|
        if key.nil?
          0
        else
          r.compute_grade_for(reg, comments, checks, [qnum, pnum, r.bnum])
        end
      end
    end
  rescue RuntimeError => e
    Rails.logger.debug e.message
    Rails.logger.debug e.backtrace
  end

  def self.new_empty(exam)
    n = exam.exam_versions.length + 1
    new(
      exam: exam,
      name: "#{exam.name} Version #{n}",
      files: [],
      info: {
        'policies' => [],
        'answers' => [],
        'contents' => {
          'reference' => [],
          'questions' => [],
        },
      },
    )
  end

  def any_started?
    registrations.started.exists?
  end

  def any_finalized?
    registrations.final.exists?
  end

  def finalize!
    registrations.each(&:finalize!)
  end

  def finalized?
    registrations.in_progress.empty?
  end

  def export_json
    JSON.pretty_generate({
      info: info,
      files: files,
    })
  end

  def export_all(dir)
    path = Pathname.new(dir)
    export_info_file(path)
    files_path = path.join('files')
    FileUtils.mkdir_p files_path
    export_files(files_path, files)
  end

  def export_info_file(path)
    File.write path.join('exam.yaml'), info.to_yaml
  end

  def export_files(path, files)
    files.each do |f|
      if f['filedir'] == 'dir'
        dpath = path.join(f['path'])
        FileUtils.mkdir_p dpath
        export_files dpath, f['nodes']
      elsif f['filedir'] == 'file'
        fpath = path.join(f['path'])
        contents = MarksProcessor.process_marks_reverse(f['contents'], f['marks'])
        File.write fpath, contents
      else
        raise 'Bad file'
      end
    end
  end

  def qp_pairs
    questions.each_with_index.map do |q, qnum|
      q['parts'].each_with_index.map do |_, pnum|
        [qnum, pnum]
      end
    end.flatten(1)
  end

  def root_rubrics
    rubrics.where(parent_section: nil)
  end

  def rubrics_for_grading
    root_rubrics.includes(rubric_preset: :preset_comments,
                          subsections: [rubric_preset: :preset_comments,
                                        subsections: [rubric_preset: :preset_comments,
                                                      subsections: [rubric_preset: :preset_comments]]])
  end

  def part_tree
    questions.each_with_index.map do |q, qnum|
      q['parts'].each_with_index.map do |p, pnum|
        yield(**{
          question: q,
          part: p,
          qnum: qnum,
          pnum: pnum,
        })
      end
    end
  end

  def bottlenose_summary
    questions.map do |q|
      parts = q['parts']
      if parts.count == 1
        {
          'name' => q.dig('name', 'value'),
          'weight' => parts.first['points'],
        }
      else
        {
          'name' => q.dig('name', 'value'),
          'parts' => parts.map do |p|
            {
              'name' => p.dig('name', 'value'),
              'weight' => p['points'],
            }.compact
          end,
        }
      end.compact
    end
  end
end
