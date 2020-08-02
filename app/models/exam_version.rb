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

  def set_rubrics!(rubrics)
    Rubric.transaction do
      convert_rubric(rubrics['examRubric'], nil, nil, nil)
      rubrics['questions']&.each_with_index do |qrubric, qnum|
        puts "#{qnum} => #{qrubric.keys} ==> $#{qrubric}"
        convert_rubric(qrubric['questionRubric'], qnum, nil, nil)
        qrubric['parts']&.each_with_index do |prubric, pnum|
          puts "#{qnum}, #{pnum} => #{prubric.keys} ==> #{prubric}"
          convert_rubric(prubric['partRubric'], qnum, pnum, nil)
          prubric['body']&.each_with_index do |brubric, bnum|
            puts "#{qnum}, #{pnum}, #{bnum} => #{brubric.keys} ==> #{brubric}"
            convert_rubric(brubric, qnum, pnum, bnum)
          end
        end
      end
    end
    puts self.rubrics
  end

  def convert_rubric(r, qnum, pnum, bnum, order = nil, parent = nil)
    return if r.nil?
    puts "#{qnum}, #{pnum}, #{bnum}, #{order} => #{r}"
    rubric = Rubric.create(type: r['type'].capitalize,
      qnum: qnum,
      pnum: pnum,
      bnum: bnum,
      order: order,
      parent_section: parent,
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
    p = RubricPreset.create(
      label: presets['label'],
      direction: presets['direction'],
      mercy: presets['mercy']&.to_f,
      rubric: rubric
    )
    rubric.rubric_presets << p
    presets['presets']&.each_with_index do |preset, pindex|
      p.preset_comments << PresetComment.create(
        label: preset['label'],
        points: preset['points'],
        grader_hint: preset['graderHint'],
        student_feedback: preset['studentFeedback'],
        order: pindex,
        rubric_preset: p
      )
    end
  end

  # def create_rubric(exam_version)
  #   rubrics = {
  #     examRubric: convert_rubric(contents['examRubric'], nil, nil, nil, nil),
  #     questions: contents['questions'].each_with_index.map do |qnum, q|
  #       {
  #         questionRubric: convert_rubric(q['questionRubric'], qnum, nil, nil, nil),
  #         parts: q['parts']&.each_with_index.map do |pnum, p|
  #           {
  #             partRubric: convert_rubric(p['partRubric'], qnum, pnum, nil, nil),
  #             body: p['body']&.each_with_index.map do |bnum, b|
  #               if (b.is_a? Hash)
  #                 convert_rubric(b.values.first['rubric'], qnum, pnum, bnum, nil)
  #               else
  #                 convert_rubric(nil, qnum, pnum, bnum, nil)
  #               end
  #             end || [],
  #           }
  #         end || [],
  #       }
  #     end || []
  #   }
  # end

  def version_rubric
    all_rubrics = rubrics.includes(subsections: {rubric_presets: [:preset_comments]})
    roots = all_rubrics.where(parent_section: nil)
    by_qnum = roots.group_by(&:qnum)
    exam_rubric = by_qnum.delete(nil)
    q_rubrics = by_qnum.map do |qnum, q_rubrics|
      by_pnum = q_rubrics.group_by(&:pnum)
      question_rubric = by_pnum.delete(nil)
      p_rubrics = by_pnum.map do |pnum, p_rubrics|
        by_bnum = p_rubrics.group_by(&:bnum)
        part_rubric = by_bnum.delete(nil)
        b_rubrics = by_bnum.map do |bnum, b_rubrics|
          # TODO: fix this
          [bnum, b_rubrics.sort_by(&:order)]
        end.to_h
        {
          part_rubric: part_rubric,
          body: b_rubrics
        }
      end
      {
        question_rubric: question_rubric,
        parts: p_rubrics
      }
    end
    {
      exam_rubric: exam_rubric,
      questions: q_rubrics
    }
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

  def self.itemrubrics_in_rubric(rubric)
    rubric.map do |r|
      if r.key? 'rubrics'
        ExamVersion.itemrubrics_in_rubric(r['rubrics'])
      else
        r
      end
    end
  end

  def all_itemrubrics
    rubrics.map do |qrubric|
      qrubric['parts'].map do |prubric|
        [
          ExamVersion.itemrubrics_in_rubric(prubric['part']),
          prubric['body'].map do |brubric|
            ExamVersion.itemrubrics_in_rubric(brubric['rubrics'])
          end,
        ]
      end
    end.flatten
  end

  # -> PartRubric
  def rubric_for_part(qnum, pnum)
    rubrics.dig(qnum, 'parts', pnum)
  end

  def part_tree
    questions.each_with_index.map do |q, qnum|
      q['parts'].each_with_index.map do |p, pnum|
        yield({
          question: q,
          part: p,
          qnum: qnum,
          pnum: pnum,
          rubric: rubric_for_part(qnum, pnum),
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
