class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :submissions
  has_one :upload

  validates_presence_of :upload

  def info
    return @info if @info
    @info = YAML.load(File.read(upload.file_name))[0]
  end
end
