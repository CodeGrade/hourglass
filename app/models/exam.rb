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

  # map of base filename to its public link
  def files_map
    ret = {}
    files.each do |file|
      ret[file[:path]] = file[:public_link]
    end
    ret
  end
end
