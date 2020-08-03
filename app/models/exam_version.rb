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

  attr_writer :json_rubrics

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
    questions.map{|q| q['parts'].map{|p| p['points']}.sum}.sum
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

  def json_rubrics=(rubrics)
    return unless self.new_record?
    convert_rubric(rubrics['examRubric'], nil, nil, nil)
    rubrics['questions']&.each_with_index do |qrubric, qnum|
      convert_rubric(qrubric['questionRubric'], qnum, nil, nil)
      qrubric['parts']&.each_with_index do |prubric, pnum|
        convert_rubric(prubric['partRubric'], qnum, pnum, nil)
        prubric['body']&.each_with_index do |brubric, bnum|
          convert_rubric(brubric, qnum, pnum, bnum)
        end
      end
    end
  end

  def convert_rubric(r, qnum, pnum, bnum, order = nil, parent = nil)
    return if r.nil?
    rubric = Rubric.new(type: r['type'].capitalize,
      qnum: qnum,
      pnum: pnum,
      bnum: bnum,
      order: order,
      parent_section: parent,
      description: r.dig('description', 'value'),
      points: r['points'],
      exam_version: self)
    self.rubrics << rubric
    if (r['choices'].is_a? Hash)
      convert_presets(r['choices'], qnum, pnum, bnum, rubric)
    else
      r['choices']&.each_with_index do |c, cindex|
        convert_rubric(c, qnum, pnum, bnum, cindex, rubric)
      end
    end
  end

  def convert_presets(presets, qnum, pnum, bnum, rubric)
    p = RubricPreset.new(
      label: presets['label'],
      direction: presets['direction'],
      mercy: presets['mercy']&.to_f,
      rubric: rubric
    )
    presets['presets']&.each_with_index do |preset, pindex|
      p.preset_comments << PresetComment.new(
        label: preset['label'],
        points: preset['points'],
        grader_hint: preset['graderHint'],
        student_feedback: preset['studentFeedback'],
        order: pindex,
        rubric_preset: p
      )
    end
  end

  def rubric_as_json
    rubric_tree = multi_group_by(rubrics_for_grading, [:qnum, :pnum, :bnum], true)
    exam_rubric = rubric_tree.delete(nil)&.dig(nil, nil)&.as_json
    q_rubrics = rubric_tree.sort.map do |qnum, q_rubrics|
      question_rubric = q_rubrics.delete(nil)&.dig(nil)&.as_json
      p_rubrics = q_rubrics.sort.map do |pnum, p_rubrics|
        part_rubric = p_rubrics.delete(nil)&.as_json
        b_rubrics = p_rubrics.sort.map{|_, b| b.as_json}
        {
          partRubric: part_rubric,
          body: b_rubrics
        }.compact
      end
      {
        questionRubric: question_rubric,
        parts: p_rubrics
      }.compact
    end
    {
      examRubric: exam_rubric,
      questions: q_rubrics
    }.compact.deep_stringify_keys
  end

  def compare_rubrics(r1, r2)
    begin
      compare_help("ROOT", r1, r2)
      true
    rescue Exception => e
      e.message
    end
  end
  def compare_help(path, r1, r2)
    if r1.is_a?(Hash) && r2.is_a?(Hash)
      mismatch = r1.keys.to_set ^ r2.keys.to_set
      unless mismatch.empty?
        raise "Mismatched keys at #{path}: #{r1.keys} ^ #{r2.keys} = #{mismatch}"
      end
      r1.keys.each do |k|
        compare_help "#{path}.#{k}", r1[k], r2[k]
      end
    elsif r1.is_a?(Array) && r2.is_a?(Array)
      unless r1.length == r2.length
        raise "Mismatched lengths at #{path}: #{r1.length} vs #{r2.length}"
      end
      (0...r1.length).each do |i|
        compare_help "#{path}[#{i}]", r1[i], r2[i]
      end
    elsif r1 != r2
      raise "Not equal at #{path}: #{r1} != #{r2}"
    end
  end

  def score_for(reg)
    begin
      comments = multi_group_by(reg.grading_comments, [:qnum, :pnum, :bnum, :preset_comment])
      checks = multi_group_by(reg.grading_checks, [:qnum, :pnum, :bnum])
      rubrics_for_grading.sum do |r|
        r.compute_grade_for(reg, comments, checks, r.qnum, r.pnum, r.bnum)
      end
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end
  end


  # Tree of questions to parts to score for that part
  def part_scores_for(reg)
    begin
    comments = multi_group_by(reg.grading_comments, [:qnum, :pnum, :bnum, :preset_comment])
    checks = multi_group_by(reg.grading_checks, [:qnum, :pnum, :bnum])
    rubric_tree = multi_group_by(rubrics_for_grading, [:qnum, :pnum, :bnum], true)
    exam_rubric = rubric_tree.dig(nil, nil, nil)
    part_tree do |qnum:, pnum:, **|
      question_rubric = rubric_tree.dig(qnum, nil, nil)
      part_rubric = rubric_tree.dig(qnum, pnum, nil)
      [
        exam_rubric&.compute_grade_for(reg, comments, checks, qnum, pnum, nil),
        question_rubric&.compute_grade_for(reg, comments, checks, qnum, pnum, nil),
        part_rubric&.compute_grade_for(reg, comments, checks, qnum, pnum, nil)
      ].compact.sum + rubric_tree.dig(qnum, pnum)&.sum do |key, r|
        if key.nil?
          0
        else
          r.compute_grade_for(reg, comments, checks, qnum, pnum, r.bnum)
        end
      end
    end
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end
  end



  def self.new_empty(exam)
    n = exam.exam_versions.length + 1
    new(
      exam: exam,
      name: "#{exam.name} Version #{n}",
      files: [],
      info: { 
        policies: [],
        answers: [],
        contents: {
          reference: [],
          questions: []
        },
        rubrics: {
          questions: [],
          examRubric: { type: 'none' }
        }
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
