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

  attr_reader :files, :info, :rubrics

  def initialize(upload)
    @upload = upload
    @upload_data = @upload.read
    @files = []
    @dir = Pathname.new(ArchiveUtils.mktmpdir)
  end

  def build_exam_version(default_name, destination = nil)
    extract_contents!
    file =
      if @dir.children.length == 1
        @dir.children.first
      else
        @dir.join('exam.yaml')
      end
    properties = YAML.safe_load(File.read(file)).deep_stringify_keys
    files = properties.delete('files')
    properties = properties['info'] if properties['info']
    raise 'Specify files either in YAML or a directory, not both' if files.present? && @files.present?

    JSON::Validator.validate!(ExamVersion::EXAM_UPLOAD_SCHEMA, properties)
    JSON::Validator.validate!(ExamVersion::FILES_SCHEMA, files) if files
    @files = files if files

    answer = FormatConverter.build_exam_version(properties, default_name, @files, destination)
    purge!

    answer
  end

  private

  def purge!
    FileUtils.remove_entry_secure @dir
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
