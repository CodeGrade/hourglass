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

  attr_reader :files
  attr_reader :info

  def initialize(upload)
    @upload = upload
    @upload_data = @upload.read
    @files = []
    @info = {}
    @dir = Pathname.new(Dir.mktmpdir)
    extract_contents!
    parse_info!
    purge!
  end

  private

  def purge!
    FileUtils.remove_entry_secure @dir
  end

  def map_reference(ref)
    {
      type: ref.keys.first,
      path: ref.values.first,
    }
  end

  EXAM_UPLOAD_SCHEMA = Rails.root.join('config/schemas/exam-upload.json').to_s

  def parse_info!
    file =
      if @dir.children.length == 1
        @dir.children.first
      else
        @dir.join('exam.yaml')
      end
    properties = YAML.safe_load(File.read(file))
    if properties.key? 'files'
      JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, properties['info'])
      JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, properties['files'])
      @info = properties['info']
      @files = properties['files']
    else
      begin
        JSON::Validator.validate!(EXAM_UPLOAD_SCHEMA, properties)
        @info = parse_info(properties)
      rescue JSON::Schema::ValidationError
        JSON::Validator.validate!(ExamVersion::EXAM_SAVE_SCHEMA, properties)
        @info = properties
      end
    end
  end

  def make_html_val(str)
    return nil if str.nil?

    {
      type: 'HTML',
      value: str,
    }
  end

  def make_html_vals(arr)
    return nil if arr.nil?

    arr.map { |i| make_html_val(i) }
  end

  def item_rubric(r)
    {
      points: r['points'],
      description: make_html_val(r['description']),
      label: r['label'],
      presets: r['presets']&.map do |preset|
        {
          points: preset['points'],
          description: make_html_val(preset['description']),
        }
      end,
      mercy: r['mercy']&.symbolize_keys,
    }.compact
  end

  def conditional_rubric(r, depth)
    {
      condition: make_html_val(r['condition']),
      rubrics: r['rubrics'].map { |r| convert_rubric(r, depth) },
    }
  end

  def convert_rubric(r, depth = 2)
    raise 'Cannot nest rubric conditions that deeply.' if depth <= 0

    if r.key? 'condition'
      conditional_rubric(r, depth - 1)
    else
      item_rubric(r)
    end
  end

  def parse_info(properties)
    contents = properties['contents']
    contents['questions'].each do |q|
      if q['parts'].length == 1 && q['separateSubparts']
        raise 'Cannot separateSubparts for a question with only one part'
      end
    end

    answers = contents['questions'].map do |q|
      q['parts'].map do |p|
        p['body'].map do |b|
          if b.is_a? String
            { NO_ANS: true }
          elsif b.is_a? Hash
            if b.key? 'AllThatApply'
              b['AllThatApply']['options'].map(&:values).flatten
            elsif b.key? 'Code'
              { NO_ANS: true }
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
              { NO_ANS: true }
            elsif b.key? 'TrueFalse'
              if b['TrueFalse'] == !! b['YesNo']
                b['TrueFalse']
              else
                b['TrueFalse']['correctAnswer']
              end
            elsif b.key? 'YesNo'
              if b['YesNo'] == !! b['YesNo']
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

    rubrics = contents['questions'].map do |q|
      {
        parts: q['parts']&.map do |p|
          {
            part: p['rubric']&.map do |r|
              convert_rubric(r)
            end || [],
            body: p['body']&.map do |b|
              {
                rubrics: (
                  if b.is_a? Hash
                    b.values.first['rubric']&.map do |r|
                      convert_rubric(r)
                    end || []
                  else
                    []
                  end
                ),
              }
            end || [],
          }
        end || [],
      }
    end

    e_reference = contents['reference']&.map{|r| map_reference r} || []
    questions = contents['questions'].map do |q|
      q_reference = q['reference']&.map{|r| map_reference r} || []
      {
        name: make_html_val(q['name']),
        separateSubparts: q['separateSubparts'],
        description: make_html_val(q['description']),
        reference: q_reference,
        parts: q['parts'].map do |p|
          p_reference = p['reference']&.map{|r| map_reference r} || []
          {
            name: make_html_val(p['name']),
            description: make_html_val(p['description']),
            points: p['points'],
            reference: p_reference,
            body: p['body'].map do |b|
              if b.is_a? String
                {
                  type: 'HTML',
                  value: b,
                }
              elsif b.is_a? Hash
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
                    if b['CodeTag']['choices'] == 'part'
                      raise 'No reference for part.' if p_reference.nil?
                      'part'
                    elsif b['CodeTag']['choices'] == 'question'
                      raise 'No reference for question.' if q_reference.nil?
                      'question'
                    elsif b['CodeTag']['choices'] == 'exam'
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
                      if b['TrueFalse'] == !!b['TrueFalse']
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
                      if b['YesNo'] == !!b['YesNo']
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
          "Could not access file:\n#{e.to_s}"
        rescue Errno::ENOENT => e
          "Somehow, #{item[:full_path]} does not exist"
        rescue Exception => e
          "Error reading file:\n#{e.to_s}"
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
      item[:text] = item[:path] + '/'
      item[:nodes] = item[:children].map { |n| with_extracted(n) }.compact
      item.delete(:children)
    end
    item
  end

  def ensure_utf8(str, mimetype)
    if ApplicationHelper.binary?(mimetype)
      str
    else
      if str.is_utf8?
        str
      else
        begin
          if str.dup.force_encoding(Encoding::CP1252).valid_encoding?
            str.encode(Encoding::UTF_8, Encoding::CP1252)
          else
            str.encode(Encoding::UTF_8, invalid: :replace, undef: :replace, replace: '?')
          end
        rescue Exception => e
          str
        end
      end
    end
  end
end
