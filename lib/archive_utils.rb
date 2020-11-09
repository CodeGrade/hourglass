# frozen_string_literal: true

require 'audit'
require 'rubygems/package'
require 'zlib'
require 'zip'
require 'fileutils'
require 'stringio'

TAR_LONGLINK = '././@LongLink'

# Since Zip::File and Gem::Package::TarReader are autoloaded,
# simply reopening the classes will fail.  These two patches
# harmonize the interfaces to both Zips and Tars, so that we
# can extract them using the same logic.
# rubocop:disable Metrics/BlockLength
Zip::File.class_exec do
  # A helper class to make the ZipEntry type more uniform
  class WrapZipEntry
    def initialize(entry)
      @entry = entry
    end

    def read
      @entry.get_input_stream.read
    end

    def directory?
      @entry.directory?
    end

    def file?
      @entry.file?
    end

    def symlink?
      @entry.symlink?
    end

    def name
      @entry.name
    end

    def unix_perms
      if @entry.directory?
        nil
      else
        @entry.unix_perms
      end
    end
  end
  def safe_each
    each do |e|
      yield(WrapZipEntry.new(e))
    end
  end
end
Gem::Package::TarReader.class_exec do
  # A helper class to make the TarEntry type more uniform
  class WrapTarEntry
    def initialize(entry, name)
      @entry = entry
      @name = name
    end

    def read
      @entry.read
    end

    def directory?
      @entry.directory?
    end

    def file?
      @entry.file?
    end

    def symlink?
      @entry.symlink?
    end

    attr_reader :name

    def unix_perms
      @entry.header.mode
    end
  end
  def safe_each
    # from https://dracoater.blogspot.com/2013/10/extracting-files-from-targz-with-ruby.html
    rewind
    dest = ''
    each do |entry|
      if entry.full_name == TAR_LONGLINK
        dest += entry.read.strip
        next
      else
        yield(WrapTarEntry.new(entry, dest + entry.full_name))
        dest = ''
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength

# Utility class for uniformly dealing with archives
class ArchiveUtils
  def self.mktmpdir
    path = File.realdirpath(Dir.mktmpdir)
    if block_given?
      yield path
    else
      path
    end
  end

  ###############################
  ## Zip file creation
  ###############################

  def self.create_zip(target, sources)
    # Each item in sources will be placed in the root of the target zip
    Zip::File.open(target, Zip::File::CREATE) do |zf|
      sources.each do |src|
        write_entry zf, src, File.basename(src)
      end
    end
  end

  private_class_method def self.write_entry(zip, disk_item, zip_path)
    if File.directory? disk_item
      zip.mkdir zip_path
      (Dir.entries(disk_item) - %w[. ..]).each do |entry|
        write_entry(zip, File.join(disk_item, entry), File.join(zip_path, entry))
      end
    else
      zip.add(zip_path, disk_item)
    end
  end

  ################################
  ## Safe archive extraction
  ###############################
  ARCHIVE_EXTENSIONS = begin
    # Supported file types
    known = {
      tar: true,
      gz: true,
      tgz: true,
      zip: true,
    }
    # Unsupported file types, taken from https://en.wikipedia.org/wiki/List_of_archive_formats
    %w[rar ar cpio shar lbr iso mar sbx bz2 lz lzma lzo sfark sz
       xz z 7z s7z ace afa alz apk arc arj b1 b6z ba bh cab
       car cfs cpt dar dd dgc dmg ear gca ha hki ice jar kgb
       lzh lha pak partimg paq6 paq7 paq8 pea pim pit qda rk sda
       sea sen sfx shk sit sitx sqx uc uc0 uc2 ucn ur2 ue2 uca
       uha war wim xar xp3 yz1 zipx zoo zpaq zz ecc par par2 rev].each do |ext|
      known[ext] = false
    end
    known
  end

  MAX_FILES = 125

  MAX_SIZE = 10.megabytes

  # Custom exception for when a file can't be read
  class FileReadError < RuntimeError
    attr_accessor :file, :type, :exn

    def initialize(file, type, exn)
      super
      @file = file
      @type = type
      @exn = exn
    end

    def to_s
      "Could not successfully read #{type} #{file}:\n #{exn}"
    end
  end

  # Custom exception for when the archive contains too many files
  class FileCountLimit < RuntimeError
    attr_accessor :limit, :file

    def initialize(limit, file)
      super
      @limit = limit
      @file = file
    end

    def to_s
      "Too many entries (more than #{limit}) in #{file}"
    end
  end

  # Custom exception for when the archive expands too large
  class FileSizeLimit < RuntimeError
    attr_accessor :limit, :file

    def initialize(limit, file)
      super
      @limit = limit
      @file = file
    end

    def to_s
      size = ActiveSupport::NumberHelper.number_to_human_size(limit)
      "Extracted contents of #{file} are too large (more than #{size})"
    end
  end

  # Custom exception for when the archive extracts outside its root directory
  class SafeExtractionError < RuntimeError
    attr_accessor :file, :link, :dest

    def initialize(file, dest, link)
      super
      @file = file
      @dest = dest
      @link =
        if link.is_a? Array
          link
        else
          [link]
        end
    end

    def to_s
      do_does = (@link.length == 1 ? 'does' : 'do')
      "Could not extract #{file} to #{dest}: #{link.join(', ')} #{do_does} not stay within the extraction directory"
    end
  end

  def self.is_zip?(file, mime)
    mime == 'application/zip' || file.ends_with?('.zip')
  end

  def self.is_tar?(file, mime)
    mime == 'application/x-tar' || file.ends_with?('.tar')
  end

  def self.is_tar_gz?(file, mime)
    mime == 'application/x-compressed-tar' || file.ends_with?('.tar.gz') || file.ends_with?('.tgz')
  end

  def self.is_gz?(file, mime)
    mime == 'application/gzip' || file.ends_with?('.gz')
  end

  def self.too_many_files?(file, mime, limit = ArchiveUtils::MAX_FILES)
    if is_zip?(file, mime)
      zip_too_many_files?(file, limit)
    elsif is_tar?(file, mime)
      tar_too_many_files?(file, limit)
    elsif is_tar_gz?(file, mime)
      tar_gz_too_many_files?(file, limit)
    elsif is_gz?(file, mime)
      false # A .gz file only contains a single file
    else
      false # it's a single file
    end
  end

  # rubocop:disable Style/NegatedIf
  def self.invalid_paths?(file, mime)
    if is_zip?(file, mime)
      zip_invalid_paths?(file)
    elsif is_tar?(file, mime)
      tar_invalid_paths?(file)
    elsif is_tar_gz?(file, mime)
      tar_gz_invalid_paths?(file)
    elsif is_gz?(file, mime)
      if !(file.encode('utf-8').valid_encoding? rescue false)
        raise FileReadError(file, mime, 'File name is not valid UTF-8')
      end

      false # A .gz file only contains a single file
    else
      if !(file.encode('utf-8').valid_encoding? rescue false)
        raise FileReadError(file, mime, 'File name is not valid UTF-8')
      end

      false # it's a single file
    end
  end

  def self.total_size_too_large?(file, mime, limit = ArchiveUtils::MAX_SIZE)
    if is_zip?(file, mime)
      zip_total_size_too_large?(file, limit)
    elsif is_tar?(file, mime)
      tar_total_size_too_large?(file, limit)
    elsif is_tar_gz?(file, mime)
      tar_gz_total_size_too_large?(file, limit)
    elsif is_gz?(file, mime)
      gzip_total_size_too_large?(file, limit)
    else
      raise FileSizeLimit.new(file, limit) if File.size(file) >= limit

      false
    end
  end

  def self.extract(file, mime, dest, force_readable: false)
    # Extracts the file to the given destination
    # Ensures that any symlinks created are entirely local to the destination
    # Assumes that too_many_files? and total_size_too_large? are ok with this file
    # Raises an exception if symlinks are malicious

    if is_zip?(file, mime)
      zip_extract(file, dest, force_readable)
    elsif is_tar?(file, mime)
      tar_extract(file, dest, force_readable)
    elsif is_tar_gz?(file, mime)
      tar_gz_extract(file, dest, force_readable)
    elsif is_gz?(file, mime)
      dest = File.join(dest, File.basename(file, '.gz'))
      gzip_extract(file, dest, force_readable)
    else
      raise SafeExtractionError.new(file, dest, nil) if File.symlink?(file)

      FileUtils.cp(file, dest)
      FileUtils.chmod 'u+r', dest, verbose: false if force_readable
    end
  end
  # rubocop:enable Style/NegatedIf

  def self.to_json(file, mime)
    # Extracts the file to a JSON dictionary
    # Ensures that any symlinks are entirely local to the JSON result
    # Assumes that too_many_files? and total_size_too_large? are ok with this file
    # Raises an exception if symlinks are malicious

    if is_zip?(file, mime)
      zip_to_json(file)
    elsif is_tar?(file, mime)
      tar_to_json(file)
    elsif is_tar_gz?(file, mime)
      tar_gz_to_json(file)
    elsif is_gz?(file, mime)
      gzip_to_json(file)
    else
      raise SafeExtractionError.new(file, dest, nil) if File.symlink?(file)

      file_to_json(file, File.read(file), File.stat(file).mode)
    end
  end

  def self.entries(file, mime, from_stream: nil)
    if is_zip?(file, mime)
      zip_entries(file, from_stream)
    elsif is_tar?(file, mime)
      tar_entries(file, from_stream)
    elsif is_tar_gz?(file, mime)
      tar_gz_entries(file, from_stream)
    elsif is_gz?(file, mime)
      [[File.basename(file, '.gz'), true]].to_h
    else
      [[file, true]].to_h
    end
  end

  ##############################
  # File counts
  ##############################
  private_class_method def self.zip_too_many_files?(file, limit)
    Zip::File.open(file) { |zip| helper_too_many_files?(file, 'zip', zip, limit) }
  end

  private_class_method def self.tar_too_many_files?(file, limit)
    File.open(file) do |stream|
      Gem::Package::TarReader.new(stream) { |tar| helper_too_many_files?(file, 'tar', tar, limit) }
    end
  end

  private_class_method def self.tar_gz_too_many_files?(file, limit)
    Zlib::GzipReader.open(file) do |stream|
      Gem::Package::TarReader.new(stream) { |tar| helper_too_many_files?(file, 'tgz', tar, limit) }
    end
  end

  private_class_method def self.helper_too_many_files?(file, type, stream, limit)
    count = 0
    stream.each do
      count += 1
      raise FileCountLimit.new(limit, file) if count > limit
    end

    false
  rescue FileCountLimit => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, type, e)
  end

  ##############################
  # Valid path names
  ##############################
  private_class_method def self.zip_invalid_paths?(file)
    Zip::File.open(file) { |zip| return helper_invalid_paths?(file, 'zip', zip) }
  end

  private_class_method def self.tar_invalid_paths?(file)
    File.open(file) do |stream|
      Gem::Package::TarReader.new(stream) { |tar| return helper_invalid_paths?(file, 'tar', tar) }
    end
  end

  private_class_method def self.tar_gz_invalid_paths?(file)
    Zlib::GzipReader.open(file) do |stream|
      Gem::Package::TarReader.new(stream) { |tar| return helper_invalid_paths?(file, 'tgz', tar) }
    end
  end

  private_class_method def self.helper_invalid_paths?(file, type, stream)
    stream.safe_each do |entry|
      unless (entry.name.encode('utf-8').valid_encoding? rescue false)
        raise FileReadError.new(file, type, "Entry name `#{entry.name}` is not valid UTF-8")
      end
    end
    false
  rescue FileReadError => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, type, e)
  end

  ##############################
  # Entries
  ##############################
  private_class_method def self.zip_entries(file, stream)
    if stream
      Zip::File.open_buffer(stream) { |zip| return helper_entries(file, 'zip', zip) }
    else
      Zip::File.open(file) { |zip| return helper_entries(file, 'zip', zip) }
    end
  end

  private_class_method def self.tar_entries(file, stream)
    stream =
      if stream
        StringIO.new(stream)
      else
        File.open(file)
      end
    Gem::Package::TarReader.new(stream) { |tar| return helper_entries(file, 'tar', tar) }
  end

  private_class_method def self.tar_gz_entries(file, stream)
    stream =
      if stream
        Zlib::GzipReader.new(StringIO.new(stream))
      else
        Zlib::GzipReader.open(file)
      end
    Gem::Package::TarReader.new(stream) { |tar| return helper_entries(file, 'tgz', tar) }
  end

  private_class_method def self.helper_entries(file, type, stream)
    output = {}
    stream.safe_each do |entry|
      out = encode_or_escape(File.join('/', entry.name.gsub('\\', '/').sub(%r{/$}, '')))
      next if out.to_s.match?('__MACOSX') || out.to_s.match?('.DS_Store')

      out = out.squeeze('/') # eliminate consecutive slashes
      out = out.sub(%r{/$}, '') # eliminate trailing slash
      if (out.starts_with?(File::SEPARATOR) rescue false)
        temp = output
        File.dirname(out).to_s.split(File::SEPARATOR).each do |dir|
          next if dir.blank?

          temp[dir] = {} if temp[dir].nil?
          temp = temp[dir]
        end
        temp[File.basename(out)] = true unless entry.directory?
      else
        Rails.logger.debug "Problem with #{entry.name}"
        # raise SafeExtractionError.new(file, "./", entry.name)
      end
    end
    output
  rescue FileReadError => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, type, e)
  end

  ##############################
  # File sizes
  ##############################
  private_class_method def self.zip_total_size_too_large?(file, limit)
    Zip::File.open(file) do |zf|
      total = 0
      zf.each do |f|
        if f.file?
          # Adapted from the implementation of ::Zip::Entry#create_file
          f.get_input_stream do |fs|
            buf = ''
            while (total < limit && !fs.eof?)
              buf = fs.sysread(limit - total, buf)
              total += buf.length
            end
          end
        end
        raise FileSizeLimit.new(limit, file) if total >= limit
      end
    end
    false
  rescue FileSizeLimit => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, 'zip', e)
  end

  private_class_method def self.tar_total_size_too_large?(file, limit)
    raise FileSizeLimit.new(limit, file) if File.size(file) >= limit

    false
  rescue FileSizeLimit => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, 'tar', e)
  end

  private_class_method def self.tar_gz_total_size_too_large?(file, limit)
    gzip_total_size_too_large?(file, limit)
  rescue FileSizeLimit => e
    raise e
  rescue FileReadError => e
    raise FileReadError.new(file, 'tgz', e.exn)
  rescue RuntimeError => e
    raise FileReadError.new(file, 'tgz', e)
  end

  private_class_method def self.gzip_total_size_too_large?(file, limit)
    Zlib::GzipReader.open(file) do |zf|
      zf.readpartial(limit) while (!zf.eof? && zf.pos < limit)

      raise FileSizeLimit.new(limit, file) if zf.pos >= limit
    end
    false
  rescue FileSizeLimit => e
    raise e
  rescue RuntimeError => e
    raise FileReadError.new(file, 'gz', e)
  end

  ##############################
  # File extraction
  ##############################

  private_class_method def self.safe_realdir(path)
    # Returns the realdirpath of some maximal safe prefix of path by eliminating safe suffixes
    # A safe prefix or suffix is one that doesn't use ./ or ../ anywhere
    # The idea is to generalize realdirpath to accept some/real/path/not/yet/existing,
    # when some/real/path already exists and not/yet/existing is safe.
    # (This could only mean that we'd use mkdir_p to create not/yet/existing
    # within some/real/path, which is indeed nested within some/real/path.)

    path = path.squeeze('/') # eliminate consecutive slashes
    path = path.sub(%r{/$}, '') # eliminate trailing slash
    until (File.realdirpath(path) rescue false)
      return nil if path =~ %r{(^|/)\.\.$} # Doesn't contain any prefix

      path = path.sub(%r{(^|/)[^/]+$}, '')
    end
    File.realdirpath(path)
  end

  private_class_method def self.encode_or_escape(str)
    str.encode('utf-8')
  rescue RuntimeError
    str.force_encoding('utf-8')
    if str.valid_encoding?
      str
    else
      str.scrub { |bytes| "<#{bytes.unpack1('H*')}>" }
    end
  end

  # rubocop:disable Metrics/PerceivedComplexity, Style/GuardClause, Metrics/BlockNesting
  private_class_method def self.helper_extract(file, type, archive, dest, force_readable)
    seen_symlinks = false
    archive.safe_each do |entry|
      out = encode_or_escape(File.join(dest, entry.name.gsub('\\', '/').sub(%r{/$}, '')))
      next if out.to_s.match?('__MACOSX') || out.to_s.match?('.DS_Store')

      if (safe_realdir(out).starts_with?(dest.to_s) rescue false)
        if entry.directory?
          FileUtils.rm_rf out unless File.directory? out
          FileUtils.mkdir_p out, mode: entry.unix_perms, verbose: false
        elsif entry.file?
          FileUtils.rm_rf out unless File.file? out
          FileUtils.mkdir_p(File.dirname(out))
          File.open(out, 'wb') { |f| f.print entry.read }
          FileUtils.chmod entry.unix_perms, out, verbose: false if entry.unix_perms
          FileUtils.chmod 'u+r', out, verbose: false if force_readable
        else
          FileUtils.rm_rf out unless File.file? out
          FileUtils.mkdir_p(File.dirname(out))
          seen_symlinks = true
          # skip creating the symlink for now
        end
      else
        Rails.logger.debug safe_realdir(out)
        Rails.logger.debug dest
        Rails.logger.debug file
        Rails.logger.debug entry.name
        raise SafeExtractionError.new(file, dest, entry.name)
      end
    end
    if seen_symlinks
      # Now go through again, only for creating the symlinks
      archive.safe_each do |entry|
        if entry.symlink?
          out = encode_or_escape(File.join(dest, entry.name))
          link_target = entry.read
          # Using realdirpath because symlinks shouldn't need to create any directories
          if (File.realdirpath(link_target, dest).to_s.starts_with?(dest.to_s) rescue false)
            File.symlink link_target, out
          else
            raise SafeExtractionError.new(file, dest.to_s, entry.name)
          end
        end
      end
    end
    true
  rescue RuntimeError => e
    Rails.logger.debug e
    Rails.logger.debug e.backtrace
    raise FileReadError.new(file, type, e)
  end
  # rubocop:enable Metrics/PerceivedComplexity, Style/GuardClause, Metrics/BlockNesting

  private_class_method def self.zip_extract(file, dest, force_readable)
    Zip::File.open(file) { |zf| helper_extract(file, 'zip', zf, dest, force_readable) }
  end

  private_class_method def self.tar_extract(file, dest, force_readable)
    File.open(file) do |source|
      helper_extract(file, 'tar', Gem::Package::TarReader.new(source), dest, force_readable)
    end
  end

  private_class_method def self.tar_gz_extract(file, dest, force_readable)
    Zlib::GzipReader.open(file) do |source|
      helper_extract(file, 'tar_gz', Gem::Package::TarReader.new(source), dest, force_readable)
    end
  end

  private_class_method def self.gzip_extract(file, dest, force_readable)
    Zlib::GzipReader.open(file) do |input_stream|
      File.open(dest, 'w') do |output_stream|
        IO.copy_stream(input_stream, output_stream)
      end
      FileUtils.chmod 'u+r', dest, verbose: false if force_readable
    end
    true
  end

  private_class_method def self.traverse_and_make_path(file, dest, entry_name, safe_dir, cur)
    safe_dir.each do |dir|
      raise SafeExtractionError(file, dest, entry_name) if cur[:type] == :file

      cur[:contents][dir] = dir_to_json(dir) if cur[:contents][dir].nil?
      cur = cur[:contents][dir]
    end
    cur
  end

  private_class_method def self.helper_to_json(file, type, archive)
    seen_symlinks = false
    dest = '/tmp/<json>'
    ans = dir_to_json('')
    archive.safe_each do |entry|
      out = encode_or_escape(File.join(dest, entry.name.gsub('\\', '/').sub(%r{/$}, '')))
      next if out.to_s.match?('__MACOSX') || out.to_s.match?('.DS_Store')

      safe_dir = safe_realdir(out)
      Rails.logger.debug "Safe_dir: #{safe_dir}, out: #{out}, dest: #{dest}"
      if (safe_dir.starts_with?(dest) rescue false)
        path = Pathname.new(out.gsub(dest, '')).each_filename.to_a
        Rails.logger.debug "Path: #{path}"
        if entry.directory?
          traverse_and_make_path(file, dest, entry.name, path, ans)
        elsif entry.file?
          filename = path.pop
          cur = traverse_and_make_path(file, dest, entry.name, path, ans)
          cur[:contents][filename] = file_to_json(filename, entry.read, entry.unix_perms)
        else
          path.pop
          traverse_and_make_path(file, dest, entry.name, path, ans)
          seen_symlinks = true
          # skip creating the symlink for now
        end
      else
        Rails.logger.debug safe_realdir(out)
        Rails.logger.debug dest
        Rails.logger.debug file
        Rails.logger.debug entry.name
        raise SafeExtractionError.new(file, dest, entry.name)
      end
    end
    if seen_symlinks
      # Now go through again, only for creating the symlinks
      archive.safe_each do |entry|
        if entry.symlink?
          out = encode_or_escape(File.join(dest, entry.name))
          src_path = Pathname.new(safe_realdir(out).gsub(dest, ''))
          link_target = entry.read
          dest_path = safe_realdir(link_target)
          raise SafeExtractionError.new(file, '<json>', entry.name) unless dest_path.starts_with(dest)

          target = traverse_and_make_path(file, dest, entry.name, Path.name.new(dest_path.gsub(dest, '')), ans)
          filename = src_path.pop
          src_dir = traverse_and_make_path(file, dest, entry.name, src_path, ans)
          src_dir[:contents][filename] = {
            name: filename,
            type: :symlink,
            target: target,
          }
        end
      end
    end
    ans
  rescue RuntimeError => e
    Rails.logger.debug e
    Rails.logger.debug e.backtrace
    raise FileReadError.new(file, type, e)
  end

  private_class_method def self.zip_to_json(file)
    Zip::File.open(file) { |zf| helper_to_json(file, 'zip', zf) }
  end

  private_class_method def self.tar_to_json(file)
    File.open(file) { |source| helper_to_json(file, 'tar', Gem::Package::TarReader.new(source)) }
  end

  private_class_method def self.tar_gz_to_json(file)
    Zlib::GzipReader.open(file) do |source|
      helper_to_json(file, 'tar_gz', Gem::Package::TarReader.new(source))
    end
  end

  private_class_method def self.gzip_to_json(file)
    Zlib::GzipReader.open(file) do |input_stream|
      file_to_json(file, input_stream.read, File.stat(file).mode)
    end
  end

  private_class_method def self.file_to_json(name, contents, perms)
    {
      name: name,
      type: :file,
      contents: contents,
      perms: perms,
    }
  end

  private_class_method def self.dir_to_json(name)
    {
      name: name,
      type: :dir,
      contents: {},
    }
  end
end
