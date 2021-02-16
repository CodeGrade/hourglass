# frozen_string_literal: true

require 'marks_processor'
require 'find'

# Uploaded files from the user.
# Used for processing the upload before storing it in the exam.
# Needs at least exam.yaml.
#
# optionally a ZIP:
# zip_dir/
# +-- exam.yaml
# +-- files/
# |   ...
#
# The 'files' dir contains the relevant code for the exam.
#
# upload_dir/
# +-- original/
# |   +-- original_filename
# +-- extracted/
# |   ... unzipped contents, or copied file ...
# +-- embedded/
#     +-- files/
#         +-- Example.rkt/
#         |   ... extracted embedded contents
class Upload
  include UploadsHelper

  attr_reader :files, :info

  def initialize(upload)
    @upload = upload
    @upload_data = @upload.read
    @files = []
    @info = {}
    @dir = Pathname.new(ArchiveUtils.mktmpdir)
    extract_contents!
    parse_info!
    purge!
  end

  private

  def purge!
    FileUtils.remove_entry_secure @dir
  end

  def self.map_reference(ref)
    return nil if ref.nil?
    {
      type: ref.keys.first,
      path: ref.values.first,
    }
  end

  def self.unmap_reference(ref)
    return nil if ref.nil?

    { ref['type'] => ref['path'] }
  end

  EXAM_UPLOAD_SCHEMA = Rails.root.join('config/schemas/exam-upload.json').to_s

  def parse_info!
    file =
      if @dir.children.length == 1
        @dir.children.first
      else
        @dir.join('exam.yaml')
      end
    properties = YAML.safe_load(File.read(file)).deep_stringify_keys
    if properties.key? 'files'
      JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, properties['info'])
      JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, properties['files'])
      @info = properties['info']
      @files = properties['files']
    else
      begin
        JSON::Validator.validate!(EXAM_UPLOAD_SCHEMA, properties)
        @info = Upload.parse_info(properties).deep_stringify_keys
      rescue JSON::Schema::ValidationError
        JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, properties)
        @info = properties
      end
    end
  end

  def self.make_html_val(str)
    return nil if str.nil?

    {
      type: 'HTML',
      value: str,
    }
  end

  def self.unmake_html_val(html, nil_if_blank = false)
    return nil if html.nil?
    return nil if html.blank? && nil_if_blank

    return html['value']
  end

  def self.make_html_vals(arr)
    return nil if arr.nil?

    arr.map { |i| make_html_val(i) }
  end

  def self.unmake_html_vals(arr)
    return nil if arr.nil?

    arr.map { |i| unmake_html_val(i) }
  end

  def self.convert_presets(preset)
    return nil if preset.nil?

    {
      label: preset['label'],
      direction: preset['direction'],
      mercy: preset['mercy'],
      presets: preset['presets']&.map do |p|
        {
          label: p['label'],
          graderHint: p['graderHint'],
          studentFeedback: p['studentFeedback'],
          points: p['points'],
        }.compact
      end&.compact,
    }.compact
  end

  def self.revert_presets(preset)
    # N.B. seems to be an identity function; are there any changes to be made?
    return nil if preset.nil?

    {
      label: preset['label'].blank? ? nil : preset['label'],
      direction: preset['direction'],
      mercy: preset['mercy'],
      presets: preset['presets']&.map do |p|
        {
          label: p['label'].blank? ? nil : p['label'],
          graderHint: p['graderHint'],
          studentFeedback: p['studentFeedback'],
          points: p['points'],
        }.compact
      end&.compact,
    }.compact
  end

  def self.convert_rubric(rubric)
    return { type: 'none' } if rubric.nil?

    {
      type: rubric['type'],
      description: make_html_val(rubric['description']),
      points: rubric['points'],
      choices:
        if rubric['choices'].is_a? Array
          rubric['choices'].map { |c| convert_rubric(c) }
        else
          convert_presets(rubric['choices'])
        end,
    }.compact
  end

  def self.revert_rubric(rubric)
    return nil if rubric.nil? || rubric['type'] == 'none'

    {
      type: rubric['type'],
      description: unmake_html_val(rubric['description'], true),
      points: rubric['points'],
      choices:
      if rubric['choices'].is_a? Array
        rubric['choices'].map { |c| revert_rubric(c) }
      else
        revert_presets(rubric['choices'])
      end,
    }.compact
  end

  # rubocop:disable Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/BlockNesting
  def self.parse_info(properties)
    contents = properties['contents']
    contents['questions'].each do |q|
      if q['parts'].length == 1 && q['separateSubparts']
        raise 'Cannot separateSubparts for a question with only one part'
      end
    end

    answers = contents['questions'].map do |q|
      q['parts'].map do |p|
        p['body'].map do |b|
          case b
          when String
            { NO_ANS: true }
          when Hash
            if b.key? 'AllThatApply'
              b['AllThatApply']['options'].map(&:values).flatten
            elsif b.key? 'Code'
              if b['Code']['correctAnswer'].is_a? String
                { 'text' => b['Code']['correctAnswer'], 'marks' => [] }
              else
                { NO_ANS: true }
              end
            elsif b.key? 'CodeTag'
              {
                selectedFile: b['CodeTag']['correctAnswer']['filename'],
                lineNumber: b['CodeTag']['correctAnswer']['line'],
              }
            elsif b.key? 'Matching'
              b['Matching']['correctAnswers']
            elsif b.key? 'MultipleChoice'
              b['MultipleChoice']['correctAnswer']
            elsif b.key? 'Text'
              b['Text']['correctAnswer'] || { NO_ANS: true }
            elsif b.key? 'TrueFalse'
              if (b['TrueFalse'] == true) || (b['TrueFalse'] == false)
                b['TrueFalse']
              else
                b['TrueFalse']['correctAnswer']
              end
            elsif b.key? 'YesNo'
              if (b['YesNo'] == true) || (b['YesNo'] == false)
                b['YesNo']
              else
                b['YesNo']['correctAnswer']
              end
            else
              raise 'Bad body item'
            end
          end
        end
      end
    end

    rubrics = {
      examRubric: convert_rubric(contents['examRubric']),
      questions: contents['questions'].map do |q|
        {
          questionRubric: convert_rubric(q['questionRubric']),
          parts: q['parts']&.map do |p|
            {
              partRubric: convert_rubric(p['partRubric']),
              body: p['body']&.map do |b|
                if (b.is_a? Hash)
                  convert_rubric(b.values.first['rubric'])
                else
                  convert_rubric(nil)
                end
              end || [],
            }
          end || [],
        }
      end || [],
    }

    e_reference = contents['reference']&.map { |r| map_reference r } || []
    questions = contents['questions'].map do |q|
      q_reference = q['reference']&.map { |r| map_reference r } || []
      {
        name: make_html_val(q['name']),
        separateSubparts: q['separateSubparts'],
        description: make_html_val(q['description']),
        extraCredit: q['extraCredit'],
        reference: q_reference,
        parts: q['parts'].map do |p|
          p_reference = p['reference']&.map { |r| map_reference r } || []
          {
            name: make_html_val(p['name']),
            description: make_html_val(p['description']),
            points: p['points'],
            extraCredit: p['extraCredit'],
            reference: p_reference,
            body: p['body'].map do |b|
              case b
              when String
                {
                  type: 'HTML',
                  value: b,
                }
              when Hash
                if b.key? 'AllThatApply'
                  {
                    type: 'AllThatApply',
                    prompt: make_html_val(b['AllThatApply']['prompt']),
                    options: make_html_vals(b['AllThatApply']['options'].map(&:keys).flatten),
                  }
                elsif b.key? 'Code'
                  initial = b['Code']['initial']
                  unless initial.nil?
                    if initial.key? 'file'
                    #   filename = initial['file']
                    #   file = files[filename]
                    #   raise "Invalid file for Code initial: #{filename}" if file.nil?
                    else
                      processed = MarksProcessor.process_marks(ensure_utf8(initial['code'], 'text/plain'))
                      initial = {
                        text: processed[:text],
                        marks: processed[:marks],
                      }
                    end
                  end
                  {
                    type: 'Code',
                    prompt: make_html_val(b['Code']['prompt']),
                    lang: b['Code']['lang'],
                    initial: initial,
                  }.compact
                elsif b.key? 'CodeTag'
                  referent =
                    case b['CodeTag']['choices']
                    when 'part'
                      raise 'No reference for part.' if p_reference.nil?

                      'part'
                    when 'question'
                      raise 'No reference for question.' if q_reference.nil?

                      'question'
                    when 'exam'
                      raise 'No reference for exam.' if e_reference.nil?

                      'exam'
                    else
                      raise 'CodeTag reference is invalid.'
                    end
                  {
                    type: 'CodeTag',
                    choices: referent,
                    prompt: make_html_val(b['CodeTag']['prompt']),
                  }
                elsif b.key? 'Matching'
                  {
                    type: 'Matching',
                    prompt: make_html_val(b['Matching']['prompt']),
                    promptsLabel: make_html_val(b['Matching']['promptsLabel']),
                    valuesLabel: make_html_val(b['Matching']['valuesLabel']),
                    prompts: make_html_vals(b['Matching']['prompts']),
                    values: make_html_vals(b['Matching']['values']),
                  }.compact
                elsif b.key? 'MultipleChoice'
                  {
                    type: 'MultipleChoice',
                    prompt: make_html_val(b['MultipleChoice']['prompt']),
                    options: make_html_vals(b['MultipleChoice']['options']),
                  }
                elsif b.key? 'Text'
                  if b['Text'].nil?
                    {
                      type: 'Text',
                      prompt: '',
                    }
                  else
                    {
                      type: 'Text',
                      prompt: make_html_val(b['Text']['prompt']),
                    }
                  end
                elsif b.key? 'TrueFalse'
                  {
                    type: 'YesNo',
                    yesLabel: 'True',
                    noLabel: 'False',
                    prompt:
                      if (b['TrueFalse'] == true) || (b['TrueFalse'] == false)
                        ''
                      else
                        make_html_val(b['TrueFalse']['prompt'])
                      end,
                  }
                elsif b.key? 'YesNo'
                  {
                    type: 'YesNo',
                    yesLabel: 'Yes',
                    noLabel: 'No',
                    prompt:
                      if (b['YesNo'] == true) || (b['YesNo'] == false)
                        ''
                      else
                        make_html_val(b['YesNo']['prompt'])
                      end,
                  }
                else
                  raise 'Bad question type.'
                end
              else
                raise 'Bad body item.'
              end
            end,
          }.compact
        end,
      }.compact
    end
    {
      policies: properties['policies'] || [],
      contents: {
        questions: questions,
        reference: e_reference,
        instructions: make_html_val(contents['instructions']),
      }.compact,
      answers: answers,
      rubrics: rubrics,
    }
  end

  def self.unparse_info(info)
    info = info.deep_stringify_keys
    questions = info['contents']['questions'].each_with_index.map do |q, qnum|
      q_answers = info['answers'][qnum]
      q_rubrics = info['rubrics']['questions'][qnum]
      q_reference = q['reference']&.map { |r| unmap_reference r }
      q_reference = nil if q_reference.blank?
      {
        name: unmake_html_val(q['name']),
        description: unmake_html_val(q['description'], true),
        extraCredit: q['extraCredit'],
        reference: q_reference,
        separateSubparts: q['separateSubparts'],
        questionRubric: revert_rubric(q_rubrics['questionRubric']),
        parts: q['parts'].each_with_index.map do |p, pnum|
          p_answers = q_answers[pnum]
          p_rubrics = q_rubrics['parts'][pnum]
          p_reference = p['reference']&.map { |r| unmap_reference r }
          p_reference = nil if p_reference.blank?
          {
            name: unmake_html_val(p['name']),
            description: unmake_html_val(p['description'], true),
            points: p['points'],
            extraCredit: p['extraCredit'],
            reference: p_reference,
            partRubric: revert_rubric(p_rubrics['partRubric']),
            body: p['body'].each_with_index.map do |b, bnum|
              b_answer = p_answers[bnum]
              b_rubric = p_rubrics['body'][bnum]
              case b['type']
              when 'HTML'
                b['value']
              when 'AllThatApply'
                {
                  AllThatApply: {
                    prompt: unmake_html_val(b['prompt'], true),
                    options: b['options'].zip(b_answer).map do |opt, ans|
                      { unmake_html_val(opt) => ans }
                    end,
                    rubric: revert_rubric(b_rubric),
                  },
                }.compact.deep_stringify_keys
              when 'Code'
                initial = b['initial']
                unless initial.nil?
                  if initial.key? 'file'
                  else
                    unprocessed = MarksProcessor.process_marks_reverse(initial['text'], initial['marks'])
                    initial = { 'code' => unprocessed }
                  end
                end
                {
                  Code: {
                    prompt: unmake_html_val(b['prompt'], true),
                    lang: b['lang'],
                    initial: initial,
                    correctAnswer: 
                      if b_answer['NO_ANS'] || b_answer['text'].blank?
                        nil
                      else
                        MarksProcessor.process_marks_reverse(b_answer['text'], b_answer['marks'])
                      end,
                    rubric: revert_rubric(b_rubric),
                  }.compact,
                }.compact.deep_stringify_keys
              when 'CodeTag'
                {
                  CodeTag: {
                    prompt: unmake_html_val(b['prompt'], true),
                    choices: b['choices'],
                    correctAnswer: {
                      filename: b_answer['selectedFile'],
                      line: b_answer['lineNumber'],
                    },
                    rubric: revert_rubric(b_rubric),
                  }.compact,
                }.compact.deep_stringify_keys
              when 'Matching'
                {
                  Matching: {
                    prompt: unmake_html_val(b['prompt'], true),
                    promptsLabel: unmake_html_val(b['promptsLabel'], true),
                    valuesLabel: unmake_html_val(b['valuesLabel'], true),
                    prompts: unmake_html_vals(b['prompts']),
                    values: unmake_html_vals(b['values']),
                    correctAnswers: b_answer,
                    rubric: revert_rubric(b_rubric),
                  }.compact,
                }.compact.deep_stringify_keys
              when 'MultipleChoice'
                {
                  MultipleChoice: {
                    prompt: unmake_html_val(b['prompt'], true),
                    options: unmake_html_vals(b['options']),
                    correctAnswer: b_answer,
                    rubric: revert_rubric(b_rubric),
                  }.compact,
                }.compact.deep_stringify_keys
              when 'Text'
                {
                  Text: {
                    prompt: unmake_html_val(b['prompt'], true),
                    correctAnswer: b_answer,
                    rubric: revert_rubric(b_rubric),
                  }.compact,
                }.compact.deep_stringify_keys
              when 'YesNo'
                if b['yesLabel'] == 'Yes'
                  if b['prompt'] == ''
                    { 'YesNo' => b_answer }
                  else
                    { 
                      YesNo: {
                        prompt: unmake_html_val(b['prompt'], true),
                        correctAnswer: b_answer,
                        rubric: revert_rubric(b_rubric)
                      },
                    }.compact.deep_stringify_keys
                  end
                else
                  if b['prompt'] == ''
                    { 'TrueFalse' => b_answer }
                  else
                    { 
                      TrueFalse: {
                        prompt: unmake_html_val(b['prompt'], true),
                        correctAnswer: b_answer,
                        rubric: revert_rubric(b_rubric)
                      },
                    }.compact.deep_stringify_keys
                  end
                end
              else
                raise 'Bad body item.'
              end
            end
          }.compact
        end
      }.compact
    end

    e_reference = info.dig('contents', 'reference')&.map { |r| unmap_reference r }
    e_reference = nil if e_reference.blank?
    {
      policies: info['policies'],
      contents: {
        instructions: unmake_html_val(info.dig('contents', 'instructions'), true),
        questions: questions,
        reference: e_reference,
        examRubric: revert_rubric(info.dig('rubrics', 'examRubric')),
      }.compact,
    }.compact.deep_stringify_keys
  end
  # rubocop:enable Metrics/PerceivedComplexity, Metrics/BlockLength, Metrics/BlockNesting

  def rec_path(base_path, path)
    if path.symlink?
      {
        path: path.basename.to_s,
        link_to: path.dirname.join(File.readlink(path)),
        broken: (!File.exist?(File.realpath(path)) rescue true),
      }
    elsif path.file?
      {
        path: path.basename.to_s,
        full_path: path,
        relPath: path.relative_path_from(base_path),
      }
    elsif path.directory?
      {
        path: path.basename.to_s,
        relPath: path.relative_path_from(base_path),
        children: path.children.sort.collect do |child|
          rec_path(base_path, child)
        end,
      }
    end
  end

  def extract_contents!
    mimetype = @upload.content_type
    ArchiveUtils.extract(@upload.path.to_s, mimetype, @dir, force_readable: true)

    found_any = false
    Find.find(@dir) do |f|
      next unless File.file? f

      found_any = true
      next if File.extname(f).empty?

      Postprocessor.process(@dir, f)
    end
    Postprocessor.no_files_found(@dir) unless found_any

    base_path = @dir.join('files')
    return unless File.directory? base_path

    @files = rec_path(base_path, base_path)[:children]

    @files = @files.map do |f|
      with_extracted(f)
    end
    @files = @files.compact
  end

  def with_extracted(item)
    return nil if item.nil?

    if item[:full_path]
      return nil if File.basename(item[:full_path].to_s) == '.DS_Store'

      mimetype = ApplicationHelper.mime_type(item[:full_path])
      contents =
        begin
          File.read(item[:full_path].to_s)
        rescue Errno::EACCES => e
          "Could not access file:\n#{e}"
        rescue Errno::ENOENT
          "Somehow, #{item[:full_path]} does not exist"
        rescue RuntimeError => e
          "Error reading file:\n#{e}"
        end

      if mimetype.starts_with? 'image/'
        contents = Base64.encode(contents)
        item[:contents] = ensure_utf8(contents, mimetype)
      else
        processed = MarksProcessor.process_marks(ensure_utf8(contents, mimetype))
        item[:contents] = processed[:text]
        item[:marks] = processed[:marks]
      end
      item[:text] = item[:path]
      # pdf_path: item[:converted_path],
      item[:type] = mimetype
      item[:filedir] = 'file'
      item.delete(:full_path)
    elsif item[:link_to]
      item[:type] = 'symlink'
    else
      return nil if item[:path] == '__MACOSX'

      item[:filedir] = 'dir'
      item[:text] = "#{item[:path]}/"
      item[:nodes] = item[:children].map { |n| with_extracted(n) }.compact
      item.delete(:children)
    end
    item
  end

  def ensure_utf8(str, mimetype)
    return str if ApplicationHelper.binary?(mimetype)
    return str if str.is_utf8?

    begin
      if str.dup.force_encoding(Encoding::CP1252).valid_encoding?
        str.encode(Encoding::UTF_8, Encoding::CP1252)
      else
        str.encode(Encoding::UTF_8, invalid: :replace, undef: :replace, replace: '?')
      end
    rescue RuntimeError
      str
    end
  end
end
