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

  has_many :rubrics, -> { order(:order) }, dependent: :destroy, inverse_of: :exam_version
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, -> { order(:rubric_preset_id, :order) }, through: :rubric_presets

  has_many :db_references, -> { order(:index) }, class_name: 'Reference', dependent: :destroy, inverse_of: :exam_version
  has_many :db_questions, -> { order(:index) }, class_name: 'Question', dependent: :destroy, inverse_of: :exam_version

  validates :exam, presence: true

  delegate :course, to: :exam
  delegate :professors, to: :exam
  delegate :proctors_and_professors, to: :exam
  delegate :all_staff, to: :exam

  before_save do
    if rubrics.empty?
      rubrics << Rubric.new(
        exam_version: self,
        question: nil,
        part: nil,
        body_item: nil,
        type: 'None',
      )
    end
  end

  accepts_nested_attributes_for :db_questions, :rubrics, :db_references

  EXAM_UPLOAD_SCHEMA = Rails.root.join('config/schemas/exam-upload.json').to_s
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
    self[:policies].to_s.split ','
  end

  def total_points
    db_questions.includes(:parts).flat_map(&:parts).flat_map(&:points).sum
  end

  def answers
    db_questions.includes(parts: :body_items).map do |q|
      q.parts.map do |p|
        p.body_items.map do |b|
          b.answer.nil? ? { NO_ANS: true } : b.answer
        end
      end
    end
  end

  def default_answers
    def_answers = answers.map do |ans_q|
      ans_q.map do |ans_p|
        ans_p.map { |_| { NO_ANS: true } }
      end
    end
    def_answers = [[[]]] if def_answers.empty?
    {
      answers: def_answers,
      scratch: '',
    }
  end

  def swap_questions(index_from, index_to)
    swap_association(Question, db_questions, :index, index_from, index_to)
  end

  def move_questions(index_from, index_to)
    move_association(Question, db_questions, :index, index_from, index_to)
  end

  def swap_references(index_from, index_to)
    swap_association(Reference, db_references, :index, index_from, index_to)
  end

  def move_references(index_from, index_to)
    move_association(Reference, db_references, :index, index_from, index_to)
  end

  def info(format:)
    as_json(format: :graphql)
  end

  def root_rubric
    rubrics.where(
      question: nil,
      part: nil,
      body_item: nil,
    ).root_rubrics.first
  end

  # NOTE: format should be either :export or :graphql
  # Use :export when reproducing the exam-upload schema
  # USe :graphql when passing JSON data to the front-end
  def as_json(format:)
    rubric_as_json =
      if root_rubric.nil? || root_rubric.is_a?(None)
        nil
      else
        root_rubric.as_json(format: format).deep_stringify_keys
      end
    {
      'policies' => policies,
      'contents' => {
        'instructions' => compact_blank(instructions),
        'questions' => db_questions.map { |q| q.as_json(format: format) },
        (format == :export ? 'reference' : 'references') => compact_blank(db_references.where(
          question: nil,
          part: nil,
        ).map { |ref| ref.as_json(format: format) }),
        'examRubric' => rubric_as_json,
      }.compact,
    }
  end

  def rubric_as_json(format:)
    rubric_tree = multi_group_by(rubrics_for_grading, [:question, :part, :body_item], true)
    preset_comments_in_use = preset_comments.joins(:grading_comments).pluck(:id)
    exam_rubric = rubric_tree.delete(nil)&.dig(nil, nil)&.as_json(preset_comments_in_use, format: format)
    q_rubrics = rubric_tree.sort.map do |_qnum, rubrics_q|
      question_rubric = rubrics_q.delete(nil)&.dig(nil)&.as_json(preset_comments_in_use, format: format)
      p_rubrics = rubrics_q.sort.map do |_pnum, rubrics_p|
        part_rubric = rubrics_p.delete(nil)&.as_json(preset_comments_in_use, format: format)
        b_rubrics = rubrics_p.sort.map { |_, b| b.as_json(preset_comments_in_use, format: format) }
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

  def score_for(reg)
    part_scores_for(reg).flatten.sum
  rescue RuntimeError => e
    Rails.logger.debug e.message
    Rails.logger.debug e.backtrace
  end

  # rubocop:disable Metrics/PerceivedComplexity
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
          flat_key&.dig('id'),
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
        id: obj.id,
        points: obj.new_record? ? nil : obj.points,
        qnum: obj.question&.index,
        pnum: obj.part&.index,
        bnum: obj.body_item&.index,
        description: obj.description,
      }.stringify_keys
    when RubricPreset
      {
        id: obj.id,
        label: obj.label,
        direction: obj.direction,
        mercy: obj.mercy,
      }.stringify_keys
    when PresetComment
      {
        id: obj.id,
        label: obj.label,
        points: obj.points,
      }.stringify_keys
    when GradingComment
      {
        id: obj.id,
        qnum: obj.question&.index,
        pnum: obj.part&.index,
        bnum: obj.body_item&.index,
        grader: obj.creator.display_name,
        points: obj.points,
        message: obj.message,
      }.stringify_keys
    else
      obj
    end
  end
  # rubocop:enable Metrics/PerceivedComplexity

  # Tree of questions to parts to score for that part
  # rubocop:disable Metrics/PerceivedComplexity
  def detailed_grade_breakdown_for(reg)
    comments_and_rubrics = reg.grading_comments.includes(
      :creator, :question, :part, :body_item,
      preset_comment: [{ rubric_preset: [{ rubric: :parent_section }] }]
    )
    comments = multi_group_by(comments_and_rubrics, [:question_id, :part_id, :body_item_id, :preset_comment])
    checks = multi_group_by(
      reg.grading_checks.includes(:creator, :question, :part, :body_item),
      [:question_id, :part_id, :body_item_id],
    )
    rubric_tree = multi_group_by(rubrics_for_grading, [:question_id, :part_id, :body_item_id], true)
    locks = multi_group_by(reg.grading_locks.includes(:question, :part), [:question_id, :part_id], true)

    exam_rubric = rubric_tree.dig(nil, nil, nil)
    # rubocop:disable Metrics/BlockLength
    part_tree do |question:, part:, **|
      question_rubric = rubric_tree.dig(question.id, nil, nil)
      part_rubric = rubric_tree.dig(question.id, part.id, nil)
      graded = !locks.dig(question.id, part.id)&.completed_by_id.nil?
      in_progress = !locks.dig(question.id, part.id)&.grader_id.nil?
      score = part.body_items.map do |body_item|
        qpb = [question.id, part.id, body_item.id]
        nil_comments = comments.dig(question.id, part.id, body_item.id, nil) || []
        extra_comment_score = nil_comments.sum(&:points)
        body_rubric = rubric_tree.dig(question.id, part.id, body_item.id)
        rubric_score = [exam_rubric, question_rubric, part_rubric, body_rubric].compact.sum do |r|
          r_score = r.compute_grade_for(reg, comments, checks, qpb)
          r_score
        end
        extra_comment_score + rubric_score
      end.sum
      body_item_info = part.body_items.each_with_index.map do |body_item, _bnum|
        body_checks = checks.dig(question.id, part.id, body_item.id) || []
        body_comments = comments.dig(question.id, part.id, body_item.id) || {}

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

  def export_json(include_files: false)
    res_obj = { info: export_exam_info }
    res_obj['files'] = files if include_files

    JSON.pretty_generate(compact_blank(res_obj))
  end

  def export_all(dir)
    path = Pathname.new(dir)
    export_info_file(path)
    files_path = path.join('files')
    FileUtils.mkdir_p files_path
    export_files(files_path, files)
  end

  def export_info_file(path)
    File.write path.join('exam.yaml'), export_exam_info.to_yaml
  end

  def export_exam_info
    as_json(format: :export)
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
    db_questions.map do |q|
      q.parts.map do |p|
        { question: q, part: p }
      end
    end.flatten(1)
  end

  def root_rubrics
    rubrics.root_rubrics
  end

  def rubric_includes
    [
      :question, :part,
      {
        rubric_preset: :preset_comments,
        subsections: [
          :question, :part,
          {
            rubric_preset: :preset_comments,
            subsections: [
              :question, :part,
              {
                rubric_preset: :preset_comments,
                subsections: [
                  :question, :part, { rubric_preset: :preset_comments }
                ],
              }
            ],
          }
        ],
      }
    ]
  end

  def rubrics_for_grading
    root_rubrics.includes(*rubric_includes)
  end

  def part_tree
    db_questions.includes(parts: :body_items).map do |q|
      q.parts.map do |p|
        yield(**{
          question: q,
          part: p,
          qnum: q.index,
          pnum: p.index,
        })
      end
    end
  end

  def bottlenose_summary(with_names: true)
    db_questions.map do |q|
      parts = q.parts
      if parts.count == 1
        {
          'name' => with_names ? Nokogiri::HTML.fragment(q.name).content : nil,
          'weight' => parts.first['points'],
          'extra' => q.extraCredit || parts.first.extraCredit,
        }
      else
        {
          'name' => with_names ? Nokogiri::HTML.fragment(q.name).content : nil,
          'extra' => q.extraCredit,
          'parts' => parts.map do |p|
            {
              'name' => with_names ? Nokogiri::HTML.fragment(p.name).content : nil,
              'weight' => p.points,
              'extra' => p.extraCredit,
            }.compact
          end,
        }
      end.compact
    end
  end
end
