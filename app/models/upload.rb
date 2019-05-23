require 'find'

class Upload < ApplicationRecord
  include UploadsHelper

  belongs_to :user
  belongs_to :exam

  after_initialize :generate_secret_key!
  before_create :store_upload!
  after_rollback :purge!

  def purge!
    FileUtils.rm_rf (upload_dir.to_s)
  end

  def create_exam_structure(upload)
    # upload needs at least exam.yaml
    #
    # optionally a ZIP:
    # zip_dir/
    # +-- exam.yaml
    # +-- files/
    # |   +-- Example.java
    # |   +-- Example2.java
    # |   +-- Example.rkt

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

  def self.upload_path_for(p)
    p = p.to_s
    if p.starts_with?(Rails.root.to_s)
      p.gsub(Upload.base_upload_dir.to_s, "/files")
    else
      p
    end
  end

  def extracted_files
    def rec_path(path)
      path.children.sort.collect do |child|
        if child.symlink?
          {
            path: child.basename.to_s,
            link_to: Upload.upload_path_for(child.dirname.join(File.readlink(child))),
            broken: (!File.exists?(File.realpath(child)) rescue true)
          }
        elsif child.file?
          converted_path = Pathname.new(child.to_s.gsub(extracted_path.to_s,
                                                        extracted_path.dirname.join("converted").to_s))
          converted_path = converted_path.dirname.join(child.basename(child.extname).to_s + ".pdf")
          if File.exists?(converted_path)
            {path: child.basename.to_s,
             full_path: child,
             converted_path: Upload.upload_path_for(converted_path),
             public_link: Upload.upload_path_for(child)}
          else
            {path: child.basename.to_s, full_path: child, public_link: Upload.upload_path_for(child)}
          end
        elsif child.directory?
          {path: child.basename.to_s, children: rec_path(child)}
        end
      end
    end
    rec_path(extracted_path)
  end

  def original_path
    upload_dir.join("original", file_name)
  end

  def extracted_path
    upload_dir.join("extracted")
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

  def upload_dir
    pre = secret_key.slice(0, 2)
    Upload.base_upload_dir.join(user&.id.to_i.to_s, exam&.id.to_i.to_s, pre, secret_key)
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
