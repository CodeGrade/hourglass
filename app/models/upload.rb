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

  def initialize(upload, user)
    @upload = upload
    @upload_data = @upload.read
    @user = user
    @files = []
    @info = {}
    Audit.log("Uploaded file #{@upload.original_filename} for #{@user&.username} (#{@user&.id})")
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
      path: ref.values.first
    }
  end

  def parse_info!
    properties = YAML.safe_load(File.read(@dir.join('exam.yaml')))
    exam_info = properties['versions'][0]

    exam_info['questions'].each do |q|
      if q['parts'].length.zero?
        throw 'Cannot have a question with zero parts'
      elsif q['parts'].length == 1 && q['separateSubparts']
        throw 'Cannot separateSubparts for a question with only one part'
      end
    end

    answers = exam_info['questions'].map do |q|
      q['parts'].map do |p|
        p['body'].map do |b|
          if b.is_a? String
            nil
          elsif b.is_a? Hash
            if b.key? 'AllThatApply'
              b['AllThatApply']['options'].map(&:values).flatten
            elsif b.key? 'Code'
              nil
            elsif b.key? 'CodeTag'
              {
                selectedFile: b['CodeTag']['correctAnswer']['filename'],
                lineNumber: b['CodeTag']['correctAnswer']['line']
              }
            elsif b.key? 'Matching'
              b['Matching']['correctAnswers']
            elsif b.key? 'MultipleChoice'
              b['MultipleChoice']['correctAnswer']
            elsif b.key? 'Text'
              nil
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
              throw 'Bad body item'
            end
          end
        end
      end
    end

    e_reference = exam_info['reference']&.map{|r| map_reference r}
    questions = exam_info['questions'].map do |q|
      q_reference = q['reference']&.map{|r| map_reference r}
      {
        name: q['name'],
        separateSubparts: q['separateSubparts'],
        description: q['description'],
        reference: q_reference,
        parts: q['parts'].map do |p|
          p_reference = p['reference']&.map{|r| map_reference r}
          {
            name: p['name'],
            description: p['description'],
            points: p['points'],
            reference: p_reference,
            body: p['body'].map do |b|
              if b.is_a? String
                {
                  type: 'HTML',
                  value: b
                }
              elsif b.is_a? Hash
                if b.key? 'AllThatApply'
                  {
                    type: 'AllThatApply',
                    prompt: b['AllThatApply']['prompt'],
                    options: b['AllThatApply']['options'].map(&:keys).flatten
                  }
                elsif b.key? 'Code'
                  {
                    type: 'Code',
                    prompt: b['Code']['prompt'],
                    lang: b['Code']['lang'],
                    initial: b['Code']['initial'],
                  }
                elsif b.key? 'CodeTag'
                  referent =
                    if b['CodeTag']['choices'] == 'part'
                      throw 'No reference for part.' if p_reference.nil?
                      p_reference
                    elsif b['CodeTag']['choices'] == 'question'
                      throw 'No reference for question.' if q_reference.nil?
                      q_reference
                    elsif b['CodeTag']['choices'] == 'all'
                      throw 'No reference for exam.' if e_reference.nil?
                      e_reference
                    else
                      throw "CodeTag reference is invalid."
                    end
                  {
                    type: 'CodeTag',
                    choices: referent,
                    prompt: b['CodeTag']['prompt'],
                  }
                elsif b.key? 'Matching'
                  {
                    type: 'Matching',
                    prompts: b['Matching']['prompts'],
                    values: b['Matching']['values']
                  }
                elsif b.key? 'MultipleChoice'
                  {
                    type: 'MultipleChoice',
                    prompt: b['MultipleChoice']['prompt'],
                    options: b['MultipleChoice']['options']
                  }
                elsif b.key? 'Text'
                  if b['Text'].nil?
                    {
                      type: 'Text',
                      prompt: []
                    }
                  else
                    {
                      type: 'Text',
                      prompt: b['Text']['prompt']
                    }
                  end
                elsif b.key? 'TrueFalse'
                  {
                    type: 'YesNo',
                    yesLabel: 'True',
                    noLabel: 'False',
                    prompt:
                      if b['TrueFalse'] == !!b['TrueFalse']
                        []
                      else
                        b['TrueFalse']['prompt']
                      end
                  }
                elsif b.key? 'YesNo'
                  {
                    type: 'YesNo',
                    prompt:
                      if b['YesNo'] == !!b['YesNo']
                        []
                      else
                        b['YesNo']['prompt']
                      end
                  }
                else
                  throw 'Bad question type.'
                end
              else
                throw 'Bad body item.'
              end
            end
          }
        end
      }
    end
    @info =
      {
        policies: properties['policies'] || [],
        contents: {
          questions: questions,
          reference: e_reference,
          instructions: exam_info['instructions']
        },
        answers: answers
    }.to_json
  end

  def rec_path(base_path, path)
    if path.symlink?
      {
        path: path.basename.to_s,
        link_to: path.dirname.join(File.readlink(path)),
        broken: (!File.exist?(File.realpath(path)) rescue true)
      }
    elsif path.file?
      {
        path: path.basename.to_s,
        full_path: path,
        relPath: path.relative_path_from(base_path)
      }
    elsif path.directory?
      {
        path: path.basename.to_s,
        relPath: path.relative_path_from(base_path),
        children: path.children.sort.collect do |child|
          rec_path(base_path, child)
        end
      }
    end
  end

  def extract_contents!
    mimetype = @upload.content_type
    # TODO rewrite archiveutils to take callbacks for reading and writing files
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
    @files = @files.compact.to_json
  end

  def with_extracted(item)
    return nil if item.nil?

    if item[:full_path]
      return nil if File.basename(item[:full_path].to_s) == ".DS_Store"

      mimetype = ApplicationHelper.mime_type(item[:full_path])
      contents = begin
        File.read(item[:full_path].to_s)
                 rescue Errno::EACCES => e
                   "Could not access file:\n#{e.to_s}"
                 rescue Errno::ENOENT => e
                   "Somehow, #{item[:full_path]} does not exist"
                 rescue Exception => e
                   "Error reading file:\n#{e.to_s}"
      end
      if mimetype.starts_with? "image/"
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
      item[:filedir] = "file"
      item.delete(:full_path)
    elsif item[:link_to]
      item[:type] = "symlink"
    else
      return nil if item[:path] == "__MACOSX"
      item[:filedir] = "dir"
      item[:text] = item[:path] + "/"
      item[:selectable] = false
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
