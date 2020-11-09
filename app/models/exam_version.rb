# frozen_string_literal: true

require 'marks_processor'
require 'nokogiri'

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
  delegate :all_staff, to: :exam

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

  def visible_to?(user, role_for_exam, _role_for_course)
    (role_for_exam >= Exam.roles[:student]) || everyone.exists?(user.id)
  end

  def everyone
    all_staff.or(students)
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
    rub1.each_key do |k|
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
    part_scores_for(reg).flatten.sum
  rescue RuntimeError => e
    Rails.logger.debug e.message
    Rails.logger.debug e.backtrace
  end

  def flatten_groups(obj)
    # Each key in grouped has non-nil points, eventually bottoming out
    # at a rubric_preset with a direction and label, that contains
    # 1+ preset_comments.
    case obj
    when Hash
      obj.map do |k, v|
        flat_key = flatten_groups k
        flat_v = flatten_groups v
        [
          flat_key&.dig('railsId'),
          {
            'type' => k&.class&.name&.underscore,
            'info' => flat_key,
            'values' => flat_v,
          },
        ]
      end.to_h
    when Array
      obj.map { |v| flatten_groups v }
    when Rubric
      {
        railsId: obj.id,
        points: obj.new_record? ? nil : obj.points,
        qnum: obj.qnum,
        pnum: obj.pnum,
        bnum: obj.bnum,
        description: obj.description,
      }.stringify_keys
    when RubricPreset
      {
        railsId: obj.id,
        label: obj.label,
        direction: obj.direction,
        mercy: obj.mercy,
      }.stringify_keys
    when PresetComment
      {
        railsId: obj.id,
        label: obj.label,
        points: obj.points,
      }.stringify_keys
    when GradingComment
      {
        railsId: obj.id,
        qnum: obj.qnum,
        pnum: obj.pnum,
        bnum: obj.bnum,
        grader: obj.creator.display_name,
        points: obj.points,
        message: obj.message,
      }.stringify_keys
    else
      obj
    end
  end

  # Tree of questions to parts to score for that part
  # rubocop:disable Metrics/PerceivedComplexity
  def detailed_grade_breakdown_for(reg)
    comments_and_rubrics = reg.grading_comments.includes(
      :creator,
      preset_comment: [{ rubric_preset: [{ rubric: [{ parent_section: [{ parent_section: :parent_section }] }] }] }],
    )
    comments = multi_group_by(comments_and_rubrics, [:qnum, :pnum, :bnum, :preset_comment])
    checks = multi_group_by(reg.grading_checks.includes(:creator), [:qnum, :pnum, :bnum])
    rubric_tree = multi_group_by(rubrics_for_grading, [:qnum, :pnum, :bnum], true)
    locks = multi_group_by(reg.grading_locks, [:qnum, :pnum], true)

    exam_rubric = rubric_tree.dig(nil, nil, nil)
    # rubocop:disable Metrics/BlockLength
    part_tree do |qnum:, pnum:, part:, **|
      question_rubric = rubric_tree.dig(qnum, nil, nil)
      part_rubric = rubric_tree.dig(qnum, pnum, nil)
      part_rubric = rubric_tree.dig(qnum, pnum, nil)
      graded = !locks.dig(qnum, pnum)&.completed_by_id.nil?
      in_progress = !locks.dig(qnum, pnum)&.grader_id.nil?
      score = part['body'].each_with_index.map do |_, bnum|
        qpb = [qnum, pnum, bnum]
        nil_comments = comments.dig(qnum, pnum, bnum, nil) || []
        extra_comment_score = nil_comments.sum(&:points)
        body_rubric = rubric_tree.dig(*qpb)
        rubric_score = [exam_rubric, question_rubric, part_rubric, body_rubric].sum do |r|
          r_score = r.compute_grade_for(reg, comments, checks, qpb)
          r_score
        end
        extra_comment_score + rubric_score
      end.sum
      body_item_info = part['body'].each_with_index.map do |_, bnum|
        body_checks = checks.dig(qnum, pnum, bnum) || []
        body_comments = comments.dig(qnum, pnum, bnum) || {}

        grouped = body_comments.group_by { |pc, _cs| pc&.rubric_preset || RubricPreset.new(direction: 'deduction') }
                               .transform_values(&:to_h)
        grouped = grouped.group_by { |rp, _pccs| rp&.rubric || Any.new(points: 0) }.transform_values(&:to_h)
        while grouped.keys.any? { |r, _| (r.is_a?(One) || r.is_a?(Any)) && r.points.nil? }
          pointless, pointed = grouped.partition { |r, _| (r.is_a?(One) || r.is_a?(Any)) && r.points.nil? }
          pointless = pointless.group_by do |r, _rppccs|
            if (r.is_a?(One) || r.is_a?(Any)) && r.points.nil?
              r.parent_section
            else
              r
            end
          end
          pointless = pointless.map { |k, v| [k&.parent_section, v.to_h] }.to_h
          grouped = pointed.to_h.merge! pointless
        end
        grouped = flatten_groups(grouped).deep_stringify_keys

        {
          'checks' => body_checks.map do |c|
            {
              points: c.points,
              grader: c.creator.display_name,
            }
          end,
          'grouped' => grouped,
        }
      end
      {
        'score' => score,
        'graded' => graded,
        'inProgress' => in_progress,
        'body' => body_item_info,
      }
    end
    # rubocop:enable Metrics/BlockLength
  rescue RuntimeError => e
    Rails.logger.debug e.message
    Rails.logger.debug e.backtrace
  end
  # rubocop:enable Metrics/PerceivedComplexity

  def part_scores_for(reg)
    detailed_grade_breakdown_for(reg).map do |q|
      q.map do |p|
        p['score']
      end
    end
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
      info: info_no_ids,
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
    File.write path.join('exam.yaml'), info_no_ids.to_yaml
  end

  def export_files(path, files)
    files.each do |f|
      case f['filedir']
      when 'dir'
        dpath = path.join(f['path'])
        FileUtils.mkdir_p dpath
        export_files dpath, f['nodes']
      when 'file'
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
        { qnum: qnum, pnum: pnum }
      end
    end.flatten(1)
  end

  def root_rubrics
    rubrics.where(parent_section: nil)
  end

  def rubrics_for_grading
    root_rubrics.includes(rubric_preset: :preset_comments,
                          subsections: [{ rubric_preset: :preset_comments,
                                          subsections: [{ rubric_preset: :preset_comments,
                                                          subsections: [{ rubric_preset: :preset_comments }] }] }])
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

  def bottlenose_summary(with_names: true)
    questions.map do |q|
      parts = q['parts']
      if parts.count == 1
        {
          'name' => with_names ? Nokogiri::HTML.fragment(q.dig('name', 'value')).content : nil,
          'weight' => parts.first['points'],
          'extra' => q['extraCredit'] || parts.first['extraCredit'],
        }
      else
        {
          'name' => with_names ? Nokogiri::HTML.fragment(q.dig('name', 'value')).content : nil,
          'extra' => q['extraCredit'],
          'parts' => parts.map do |p|
            {
              'name' => with_names ? Nokogiri::HTML.fragment(p.dig('name', 'value')).content : nil,
              'weight' => p['points'],
              'extra' => p['extraCredit'],
            }.compact
          end,
        }
      end.compact
    end
  end

  def info_no_ids
    deep_delete_keys! info.deep_stringify_keys, ['railsId']
  end

  def deep_delete_keys!(obj, keys)
    case obj
    when Array
      obj.each { |o| deep_delete_keys!(o, keys) }
    when Hash
      keys.each { |k| obj.delete k }
      obj.each do |k, v|
        deep_delete_keys! k, keys
        deep_delete_keys! v, keys
      end
    end
    obj
  end
end
