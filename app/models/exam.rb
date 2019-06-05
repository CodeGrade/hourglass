class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :submissions
  has_one :upload

  validates_presence_of :upload
  after_initialize :generate_secret_key!

  def exam_yaml
    # TODO need to validate that this file is part of the upload before allowing the upload
    #   in a `validates` in Upload
    upload.extracted_path.join("exam.yaml")
  end

  def info
    return @info if @info
    versions = YAML.load(File.read(exam_yaml))
    @info = versions[0]
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

  def get_exam_files(folder)
    @exam_files = []
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
    def with_extracted(item)
      return nil if item.nil?
      if item[:public_link]
        return nil if File.basename(item[:full_path].to_s) == ".DS_Store"
        mimetype = ApplicationHelper.mime_type(item[:full_path])
        contents = begin
          File.read(item[:full_path].to_s)
        rescue Errno::EACCES => e
          "Could not access file:\n#{e.to_s.gsub(item[:full_path].to_s, item[:public_link].to_s)}"
        rescue Errno::ENOENT => e
          "Somehow, #{item[:public_link]} does not exist"
        rescue Exception => e
          "Error reading file:\n#{e.to_s.gsub(item[:full_path].to_s, item[:public_link].to_s)}"
        end
        @exam_files.push({
                                   link: item[:public_link],
                                   name: item[:public_link].sub(/^.*extracted\//, ""),
                                   pdf_path: item[:converted_path],
                                   contents: ensure_utf8(contents, mimetype),
                                   type: mimetype,
                                   href: @exam_files.count + 1,
                               })
        deductions = nil
        { text:
              if deductions.to_f > 0
                "#{item[:path]} (+#{deductions})"
              elsif deductions
                "#{item[:path]} (#{deductions})"
              else
                item[:path]
              end,
          href: @exam_files.count,
        }
      elsif item[:link_to]
        @exam_files.push({
                                   link_to: item[:link_to].sub(/^.*extracted\//, ""),
                                   name: item[:path],
                                   type: "symlink",
                                   href: @exam_files.count + 1,
                                   lineComments: {noCommentsFor: item[:path].to_s},
                                   broken: item[:broken]
                               })
        {
            text: item[:path] + " " + (item[:broken] ? "↯" : "⤏"),
            href: @exam_files.count
        }
      else
        return nil if item[:path] == "__MACOSX"
        {
            text: item[:path] + "/",
            state: {selectable: true},
            nodes: item[:children].map{|i| with_extracted(i)}.compact
        }
      end
    end

    @exam_dirs = self.upload.extracted_files(folder).map{|i| with_extracted(i)}.compact
    @exam_files.each do |sf|
      if sf[:type] == "symlink" && !sf[:broken]
        sf[:link_href] = @exam_files.find{|f| f[:link]&.ends_with?(sf[:link_to])}[:href]
      end
    end

    @count = @exam_files.count.to_s.length

    def fix_hrefs(node)
      if node[:href].is_a? Integer
        node[:href] = "file_" + node[:href].to_s.rjust(@count, '0')
      end
      if node[:link_href].is_a? Integer
        node[:link_href] = "file_" + node[:link_href].to_s.rjust(@count, '0')
      end
      if node[:nodes]
        node[:nodes].each do |n| fix_hrefs(n) end
      end
    end
    exam_dirs = fix_hrefs({nodes: @exam_dirs})
    exam_files = fix_hrefs({nodes: @exam_files})
    remove_instance_variable :@exam_dirs
    remove_instance_variable :@exam_files
    return exam_dirs, exam_files
  end
end
