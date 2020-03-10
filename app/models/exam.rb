# coding: utf-8

class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :rooms
  has_one :upload, dependent: :destroy

  validates_presence_of :upload
  after_initialize :generate_secret_key!

  def finalized?
    registrations.all?(&:final)
  end

  def finalize!
    rooms.map(&:finalize!)
  end

  def exam_yaml
    # TODO need to validate that this file is part of the upload before allowing the upload
    #   in a `validates` in Upload
    upload.extracted_path.join("exam.yaml")
  end

  def policy_permits?(policy)
    policies.include? policy
  end

  def policies
    properties["policies"]
  end

  def properties
    return @properties if @properties
    @properties = YAML.load(File.read(exam_yaml))
  end

  def info
    return @info if @info
    @info = properties["versions"][0]
    answer_count = 0
    @info["questions"].each do |q|
      q["parts"].each do |p|
        p["body"].each do |b|
          if b.is_a? Hash
            if b["YesNo"] == !!b["YesNo"]
              b["YesNo"] = { "prompt" => [], "correctAnswer" => b["YesNo"] }
            elsif b["TrueFalse"] == !!b["TrueFalse"]
              b["TrueFalse"] = { "prompt" => [], "correctAnswer" => b["TrueFalse"] }
            elsif b.key? "Text" && b["Text"].nil?
              b["Text"] = { "prompt" => [] }
            elsif b["CodeTag"]
              if b["CodeTag"]["choices"] == "part" && p["reference"].nil?
                throw "No reference for part."
              elsif b["CodeTag"]["choices"] == "question" && q["reference"].nil?
                throw "No reference for question."
              elsif b["CodeTag"]["choices"] == "all" && @info["reference"].nil?
                throw "No reference for exam."
              end
            end
            b['id'] = answer_count
            answer_count += 1
          end
        end
      end
    end
    return @info
  end

  def generate_secret_key!
    return unless new_record?

    unless secret_key.nil?
      raise Exception.new("Can't generate a second secret key for an exam.")
    end

    self.secret_key = SecureRandom.urlsafe_base64
  end

  def file(name)
    f = upload.extracted_path.join('files', name)
    raise "bad file '#{f}'!" unless File.exist? f

    f
  end

  def get_exam_files
    clean_up(get_raw_files(""))
  end

  private

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
      end
      item[:text] = item[:path]
      # pdf_path: item[:converted_path],
      item[:contents] = ensure_utf8(contents, mimetype)
      item[:type] = mimetype
    elsif item[:link_to]
      item[:type] = "symlink"
    else
      return nil if item[:path] == "__MACOSX"

      item[:text] = item[:path] + "/"
      item[:selectable] = false
      item[:nodes] = item[:children].map { |n| with_extracted(n) }.compact
      item.delete(:children)
    end
    item.delete(:full_path)
    item
  end

  private

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

  private

  def get_raw_files(folder)
    self.upload.extracted_files(folder, true)
  end

  def assign_ids(files)
    @count = 0
    def help(f)
      f["id"] = @count
      @count += 1
      if f[:nodes]
        f[:nodes].each { |n| help(n) }
      end
    end
    files.map { |n| help(n) }
  end

  def clean_up(raw_files)
    # def file_list(files, arr)
    #   if files[:children]
    #     files[:children].each { |n| file_list(n, arr) }
    #   else
    #     if File.basename(files[:full_path]) != ".DS_Store"
    #       arr.push(files)
    #     end
    #   end
    #   arr
    # end
    # @flat_files = raw_files.reduce([]) do |flat, raw| file_list(raw, flat) end
    # @flat_files.each do |sf|
    #   if sf[:type] == "symlink" && !sf[:broken] && sf[:link_to].is_a?(String)
    #     sf[:link_to] = @flat_files.find { |f| f[:full_path]&.ends_with?(sf[:link_to]) }
    #   end
    # end
    #
    # @count = @flat_files.count.to_s.length
    #
    # @flat_files.each_with_index do |node, i|
    #   node[:href] = "file_" + (i + 1).to_s.rjust(@count, '0')
    # end
    # @flat_files.each do |node|
    #   if node[:link_to]
    #     node[:link_href] = "file_" + node[:link_to][:href].to_s.rjust(@count, '0')
    #   end
    # end

    raw_files = raw_files.map do |f|
      with_extracted(f)
    end

    raw_files = raw_files.compact
    assign_ids(raw_files)

    raw_files
  end

end
