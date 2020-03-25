require 'find'

class Upload < ApplicationRecord
  include UploadsHelper

  belongs_to :user
  belongs_to :exam

  after_initialize :generate_secret_key!
  before_create :store_upload!
  after_commit :purge!, on: :destroy

  def purge!
    FileUtils.rm_rf base_dir.to_s
    if Dir.empty? exam_dir
      FileUtils.rm_rf exam_dir
    end
    if Dir.empty? user_dir
      FileUtils.rm_rf user_dir
    end
  end

  def create_exam_structure(upload)
    # upload needs at least exam.yaml
    #
    # optionally a ZIP:
    # zip_dir/
    # +-- exam.yaml
    # +-- files/
    # |   ...

    # 'files' contains the relevant code for the exam

    # storage of the upload in /private is as follows:
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
    upload_dir.mkpath
    upload_dir.join("original").mkpath
    File.open(original_path, 'wb') do |file|
      file.write(upload.read)
    end
  end

  def relative_path(path, target)
    target = target.to_s
    if target.starts_with?(path.to_s)
      target.gsub(path.to_s, "")
    else
      target
    end
  end

  def extracted_files(folder, strict = false)
    def rec_path(path)
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
          rel_path: path.relative_path_from(files_path),
        }
      elsif path.directory?
        {
          path: path.basename.to_s,
          rel_path: path.relative_path_from(files_path),
          children: path.children.sort.collect do |child|
            rec_path(child)
          end,
        }
      end
    end
    folder_path = files_path.join(folder)
    if File.directory? folder_path
      rec_path(folder_path)[:children]
    elsif File.exist? folder_path
      [rec_path(folder_path)]
    elsif strict
      throw "Folder path not found: '#{folder}'"
    else
      []
    end
  end

  def original_path
    upload_dir.join("original", file_name)
  end

  def extracted_path
    upload_dir.join("extracted")
  end

  def files_path
    extracted_path.join("files")
  end

  def extract_contents!(mimetype)
    return if Dir.exist?(extracted_path)

    extract_contents_to!(mimetype, extracted_path, postprocess: true, force_readable: true)
  end

  def extract_contents_to!(mimetype, extracted_path, postprocess: false, force_readable: false)
    extracted_path.mkpath
    ArchiveUtils.extract(original_path.to_s, mimetype, extracted_path.to_s, force_readable: force_readable)
    return unless postprocess

    found_any = false
    Find.find(extracted_path) do |f|
      next unless File.file? f

      found_any = true
      next if File.extname(f).empty?

      Postprocessor.process(extracted_path, f)
    end
    Postprocessor.no_files_found(extracted_path) unless found_any
  end

  def self.base_upload_dir
    Rails.root.join("private", "uploads", Rails.env)
  end

  def user_dir
    Upload.base_upload_dir.join(user_id.to_s)
  end

  def exam_dir
    user_dir.join(exam_id.to_s)
  end

  def base_dir
    pre = secret_key.slice(0, 2)
    exam_dir.join(pre)
  end

  def upload_dir
    base_dir.join(secret_key)
  end

  def generate_secret_key!
    return unless new_record?

    unless secret_key.nil?
      raise Exception.new("Can't generate a second secret key for an upload.")
    end

    self.secret_key = SecureRandom.urlsafe_base64

    if Dir.exist?(upload_dir)
      raise Exception.new("Duplicate secret key (2). That's unpossible!")
    end
  end

  def upload_data=(upload)
    @upload = upload
  end

  private

  def store_upload!
    self.file_name = @upload.original_filename

    if Dir.exist?(upload_dir)
      raise Exception.new("Duplicate secret key (1). That's unpossible!")
    end

    create_exam_structure(@upload)

    # TODO bring back archiveutils checking
    if @upload.is_a? ActionDispatch::Http::UploadedFile
      upload_path = @upload.path
    elsif @upload.is_a? String
      upload_path = @upload
    else
      upload_path = original_path
    end
    effective_mime = @upload.content_type

    extract_contents!(effective_mime)

    Audit.log("Uploaded file #{file_name} for #{user&.username} (#{user_id}) at #{secret_key}")
  end
end
